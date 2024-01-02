import Head from "next/head";
import Link from "next/link";
import {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { ZodString, set, z } from "zod";
import { Navbar } from "~/components/Navbar";
import { OrganizationType, TestType, UserType } from "~/drizzle/schema";
import { api } from "~/utils/api";
import { CardContainer } from "..";

export type OrganizationPageContextType = {
  selectedOrganization: OrganizationType | null;
  setSelectedOrganization: (organization: OrganizationType | null) => void;
};

export const defaultContext: OrganizationPageContextType = {
  selectedOrganization: null,
  setSelectedOrganization: () => {},
};

export const OrganizationPageContext =
  createContext<OrganizationPageContextType>(defaultContext);

export default function OrganizationPage() {
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationType | null>(null);
  const { data, error, isError, isLoading, refetch } =
    api.organizations.getOrganizations.useQuery();
  const organizationAdd = api.organizations.addOrganization.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const organizationUpdate =
    api.organizations.updateOrganizationData.useMutation({
      onSuccess: () => {
        refetch();
      },
    });
  const organizationDelete = api.organizations.deleteOrganization.useMutation({
    onSuccess: () => {
      setSelectedOrganization(null);
      refetch();
    },
  });

  function addOrganization() {
    organizationAdd.mutate();
  }

  function updateOrganization(organization: OrganizationType) {
    if (!selectedOrganization) {
      return;
    }
    organizationUpdate.mutate({
      organization_id: selectedOrganization.id,
      name: organization.name!,
    });
  }

  function deleteOrganization(organization: OrganizationType) {
    if (!selectedOrganization) {
      return;
    }
    organizationDelete.mutate({
      organization_id: selectedOrganization.id,
    });
  }

  const {
    isLoading: checkLoginIsLoading,
    isError: checkLoginIsError,
    data: checkLogin,
    error: checkLoginError,
  } = api.auth.isLoggedIn.useQuery();

  if (checkLoginIsLoading) {
    return;
  }

  if (checkLoginIsError) {
    return <>An error occurred: {checkLoginError.message}</>;
  }

  if (!(checkLogin.loggedIn && checkLogin.role === "teacher")) {
    window.location.href = "/";
    return;
  }

  return (
    <>
      <OrganizationPageContext.Provider
        value={{ selectedOrganization, setSelectedOrganization }}
      >
        <Head>
          <title>Multiple Choice Test</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="flex h-screen w-full">
          <Navbar></Navbar>
          <OrganizationPageContainer>
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                {isError ? (
                  <>An error occurred. {error.message}</>
                ) : (
                  <>
                    <YourOrganizations
                      organizations={data}
                      handleOrganizationAdd={addOrganization}
                    />
                  </>
                )}
              </>
            )}
          </OrganizationPageContainer>
          <div className="h-full w-full overflow-y-scroll">
            <OrganizationContainer>
              {!selectedOrganization ? (
                <>
                  <div className="text-black">Select an Organization</div>
                </>
              ) : (
                <div className="">
                  <OrganizationTopBar
                    organization={selectedOrganization}
                    handleOrganizationUpdate={updateOrganization}
                    handleOrganizationDelete={deleteOrganization}
                  />
                  <div className="p-2">
                    <div className="flex flex-col gap-3">
                      <ParticipantsSection />
                    </div>
                  </div>
                </div>
              )}
            </OrganizationContainer>
          </div>
        </div>
      </OrganizationPageContext.Provider>
    </>
  );
}
const usernameValidator = z.string().min(5).max(15);

export function ParticipantsSection() {
  const { selectedOrganization } = useContext(OrganizationPageContext);

  if (!selectedOrganization) {
    return <>Select a organization</>;
  }

  const { data, error, isLoading, isError, refetch } =
    api.organizations.getParticipants.useQuery({
      organization_id: selectedOrganization.id,
    });

  const participantAdd = api.organizations.addParticipant.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const participantRemove = api.organizations.removeParticipant.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  function addParticipant(username: string) {
    if (!selectedOrganization) {
      return;
    }
    participantAdd.mutate({
      username: username,
      organization_id: selectedOrganization.id,
    });
  }

  function removeParticipant(participant: UserType) {
    if (!selectedOrganization) {
      return;
    }
    participantRemove.mutate({
      organization_id: selectedOrganization.id,
      user_id: participant.id,
    });
  }

  return (
    <>
      {isLoading ? (
        <>Loading...</>
      ) : (
        <>
          {isError ? (
            <>An error occurred {error.message}</>
          ) : (
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold">Participants</h1>
              <Input
                label="Add a participant"
                validator={usernameValidator}
                placeholder="Enter a username"
                buttonValue="Add"
                handleSubmit={addParticipant}
                message={"A username must be between 5 to 15 characters"}
              />
              <ParticipantList
                participants={data.map((value) => {
                  return value.users!;
                })}
                handleParticipantDelete={removeParticipant}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

export function OrganizationPageContainer(props: { children: ReactNode }) {
  return (
    <div className="sticky h-full w-[25%] bg-[#EDF0FF] p-3">
      <h1 className="pb-4 text-xl font-bold">Your Organizations</h1>
      {props.children ? props.children : null}
    </div>
  );
}

export function YourOrganizations(props: {
  organizations: OrganizationType[];
  handleOrganizationAdd: () => void;
  children?: ReactNode;
}) {
  const { selectedOrganization } = useContext(OrganizationPageContext);
  const { organizations, handleOrganizationAdd } = props;

  return (
    <div className="flex h-[95%] w-full flex-col gap-3 overflow-y-scroll p-2">
      {organizations.length === 0 ? (
        <>
          <span className="italic">No organizations found</span>
        </>
      ) : (
        <>
          {organizations.map((organization) => {
            return (
              <OrganizationInfoContainer
                key={organization.id}
                organization={organization}
                selected={organization.id === selectedOrganization?.id}
              />
            );
          })}
        </>
      )}
      <button
        className="w-full rounded-lg bg-white p-2 text-center text-blue-800 outline outline-1 outline-blue-800 transition-all hover:font-bold"
        onClick={handleOrganizationAdd}
      >
        Add Organization
      </button>
    </div>
  );
}

export function OrganizationContainer(props: { children: ReactNode }) {
  const { selectedOrganization } = useContext(OrganizationPageContext);
  return (
    <div
      className={`${
        selectedOrganization ? "rounded-lg shadow" : ""
      } w-full max-w-4xl p-3`}
    >
      {props.children}
    </div>
  );
}

export function OrganizationInfoContainer(props: {
  organization: OrganizationType;
  selected: boolean;
}) {
  const organization = props.organization;
  const selected = props.selected;
  const { selectedOrganization, setSelectedOrganization } = useContext(
    OrganizationPageContext,
  );

  function handleClick() {
    setSelectedOrganization(organization);
  }

  return (
    <CardContainer>
      <div
        className={`${
          selected
            ? "outline outline-2 outline-[#1A2643] hover:shadow-md hover:shadow-[#1A2643] hover:outline-[#1A2643]"
            : "outline outline-1 outline-[#CADBFF] hover:shadow-md hover:shadow-[#CADBFF] hover:outline-[#849EFA]"
        } w-full rounded-lg bg-white p-3 transition-all hover:-translate-y-1`}
        onClick={handleClick}
      >
        <p className="truncate font-bold">{organization.name}</p>
      </div>
    </CardContainer>
  );
}

export function OrganizationTopBar(props: {
  organization: OrganizationType;
  handleOrganizationUpdate: (organization: OrganizationType) => void;
  handleOrganizationDelete: (organization: OrganizationType) => void;
}) {
  const { organization, handleOrganizationUpdate, handleOrganizationDelete } =
    props;
  const [name, setName] = useState(organization.name);
  const [isDeleting, setIsDeleting] = useState(false);
  const { selectedOrganization } = useContext(OrganizationPageContext);
  const edited = name !== organization.name;

  useEffect(() => {
    if (!selectedOrganization) {
      return;
    }
    setName(selectedOrganization.name);
  }, [selectedOrganization]);

  return (
    <>
      <div className="rounded-lg border bg-white">
        <div className="flex w-full flex-col">
          <div className="flex flex-row items-center justify-between gap-2 p-4">
            <div className="flex flex-col">
              <input
                className="bg-none text-lg font-bold text-[#1A2643] outline-none"
                value={name ? name : ""}
                onChange={(event) => {
                  setName(event.target.value);
                }}
              />
            </div>
            {edited && (
              <button
                className="rounded-lg bg-gray-300 px-3 py-1 text-white outline outline-1 outline-gray-100 transition-all hover:bg-gray-400 hover:outline-gray-300"
                onClick={() => {
                  handleOrganizationUpdate({
                    id: organization.id,
                    name: name,
                    creatorId: null,
                  });
                }}
              >
                Save Changes
              </button>
            )}
            <button className="text-lg">
              <div className="h-7 w-7">
                <img
                  src={"/trash_icon.svg"}
                  alt="Delete"
                  className="fill-[#1A2643] object-contain"
                  onClick={() => {
                    setIsDeleting(!isDeleting);
                  }}
                />
              </div>
            </button>
          </div>
          {isDeleting ? (
            <div className="flex w-full flex-row justify-between p-3">
              <p>Delete this organization? This is irreversible.</p>
              <section className="flex flex-row justify-between gap-3">
                <button
                  className="hover: rounded-lg bg-[#d47979] px-4 py-1 text-white transition-all hover:bg-[#bb4343]"
                  onClick={() => {
                    handleOrganizationDelete(organization);
                  }}
                >
                  Yes
                </button>
                <button
                  className="rounded-lg bg-white px-4 py-1 text-[#1A2643] transition-all hover:bg-gray-200"
                  onClick={() => {
                    setIsDeleting(false);
                  }}
                >
                  Cancel
                </button>
              </section>
            </div>
          ) : null}
        </div>
        <ul className="flex flex-row justify-between rounded-b-lg bg-[#1A2643] px-3 py-1 text-white"></ul>
      </div>
    </>
  );
}

export function Input(props: {
  handleSubmit: (value: string) => void;
  validator: ZodString;
  label?: string;
  placeholder?: string;
  message?: string;
  buttonValue?: string;
}) {
  const [value, setValue] = useState("");
  const [isError, setError] = useState(false);
  const { placeholder, validator, message, label, handleSubmit, buttonValue } =
    props;

  useEffect(() => {
    if (value === "") {
      setError(false);
      return;
    }
    const validation = validator.safeParse(value);
    console.log(validation.success);
    if (validation.success) {
      setError(false);
      return;
    }
    setError(true);
  }, [value]);

  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-white p-3 shadow">
      <label className="text-lg font-bold">{label ? label : ""}</label>
      <div className="flex flex-row justify-between gap-3">
        <input
          value={value}
          placeholder={placeholder ? placeholder : ""}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          className={`${
            isError
              ? "text-red border border-red-500"
              : "border border-gray-300 hover:border-gray-400 "
          } w-[90%] rounded-lg px-2 outline-none transition-all focus:outline-none`}
        />
        <button
          className={`${
            isError || value.length === 0
              ? "bg-blue-100"
              : "bg-blue-300 hover:bg-blue-400"
          } rounded-lg px-4 py-2 font-bold text-white transition-all`}
          onClick={() => {
            if (!isError) {
              handleSubmit(value);
            }
          }}
          disabled={isError || !value}
        >
          {buttonValue ? buttonValue : "Submit"}
        </button>
      </div>
      <p className="text-sm text-red-500">
        {message && isError ? message : null}
      </p>
    </div>
  );
}

export function ParticipantList(props: {
  participants: UserType[];
  handleParticipantDelete: (participant: UserType) => void;
}) {
  const { participants, handleParticipantDelete } = props;

  return (
    <>
      <div className="flex flex-col gap-2 py-2">
        {participants.map((participant) => {
          return (
            <Participant
              participant={participant}
              handleDelete={handleParticipantDelete}
            />
          );
        })}
      </div>
    </>
  );
}

export function Participant(props: {
  participant: UserType;
  handleDelete: (participant: UserType) => void;
}) {
  const { participant, handleDelete } = props;
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-white px-5 py-3 shadow transition-all hover:border-gray-300">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <p className="font-light">
            {participant.firstName} {participant.lastName}
          </p>
          <p className="font-bold italic">@{participant.userName}</p>
        </div>
        <div className="flex flex-row gap-2">
          <p className="rounded-lg bg-blue-400 px-2 py-1 text-white">
            {participant.role}
          </p>
          <button
            className=""
            onClick={() => {
              setIsDeleting(!isDeleting);
            }}
          >
            <div className="h-6 w-6">
              <img
                src={"/trash_icon.svg"}
                alt="Dropdown Toggle"
                className="fill-[#1A2643] object-contain"
              />
            </div>
          </button>
        </div>
      </div>
      {isDeleting ? (
        <div className="flex w-full flex-row justify-between">
          <p>Are you sure you want to unenroll this student?</p>
          <section className="flex flex-row justify-between gap-3">
            <button
              className="hover: rounded-lg bg-[#d47979] px-4 py-1 text-white transition-all hover:bg-[#bb4343]"
              onClick={() => {
                handleDelete(participant);
              }}
            >
              Yes
            </button>
            <button
              className="rounded-lg bg-white px-4 py-1 text-[#1A2643] outline outline-1 outline-gray-300 transition-all hover:bg-gray-200"
              onClick={() => {
                setIsDeleting(false);
              }}
            >
              Cancel
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export function TestList() {
  const { selectedOrganization } = useContext(OrganizationPageContext);

  if (!selectedOrganization) {
    return;
  }

  const { data, error, isError, isLoading, refetch } =
    api.organizations.getOrganizationTests.useQuery({
      organization_id: selectedOrganization.id,
    });
  const {
    data: teacherTests,
    error: teacherError,
    isError: teacherIsError,
    isLoading: teacherIsLoading,
  } = api.organizations.getTests.useQuery();
  const testAdd = api.organizations.addTestsToOrganization.useMutation({
    onSuccess: () => {
      console.log("something");
      refetch();
      setIsAdding(false);
    },
  });
  const testRemove = api.organizations.removeTestFromOrganization.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const [isAdding, setIsAdding] = useState(false);

  function addTests(tests: TestType[]) {
    if (!selectedOrganization) {
      return;
    }
    testAdd.mutate({ organization_id: selectedOrganization.id, tests: tests });
  }

  function removeTest(test: TestType) {
    if (!selectedOrganization) {
      return;
    }
    testRemove.mutate({ test_id: test.id });
  }

  return (
    <div className="">
      {isLoading ? (
        <>Loading...</>
      ) : (
        <>
          {isError ? (
            <>An error occurred {error.message}</>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold">Tests</h1>
                {data.length === 0 ? (
                  <>No tests found in this organization</>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      {data.map((test) => {
                        return (
                          <Test
                            key={test.id}
                            test={test}
                            handleDelete={removeTest}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export function Test(props: {
  test: TestType;
  handleDelete: (test: TestType) => void;
}) {
  const { test, handleDelete } = props;
  const [gettingRemoved, setGettingRemoved] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  return (
    <div
      className={`${
        gettingRemoved ? "opacity-80" : ""
      } flex flex-col gap-2 rounded-lg bg-white p-3 shadow outline outline-1 outline-gray-200`}
    >
      <div className="flex w-full flex-row items-center justify-between ">
        <div className="flex flex-col">
          <h1 className="font-bold">{test.title}</h1>
          <p className="font-light">{test.description}</p>
        </div>
        <button className="h-7 w-7">
          <img
            src={"/minus_icon.svg"}
            alt="Delete"
            className="fill-[#1A2643] object-contain"
            onClick={() => {
              setIsRemoving(!isRemoving);
            }}
          />
        </button>
      </div>
      {isRemoving ? (
        <div className="flex w-full flex-row justify-between">
          <p>
            Are you sure you want to remove this test from this organization?
          </p>
          <section className="flex flex-row justify-between gap-3">
            <button
              className="hover: rounded-lg bg-[#d47979] px-4 py-1 text-white transition-all hover:bg-[#bb4343]"
              onClick={() => {
                handleDelete(test);
                setIsRemoving(false);
                setGettingRemoved(true);
              }}
            >
              Yes
            </button>
            <button
              className="rounded-lg bg-white px-4 py-1 text-[#1A2643] outline outline-1 outline-gray-300 transition-all hover:bg-gray-200"
              onClick={() => {
                setIsRemoving(false);
              }}
            >
              Cancel
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

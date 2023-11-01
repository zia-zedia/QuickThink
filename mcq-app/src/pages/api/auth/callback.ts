import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { supabase } from '~/server/auth/auth'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { code } = req.query
	if (code) {
		await supabase.auth.exchangeCodeForSession(String(code))
	}
	res.redirect('/')
}

export default handler

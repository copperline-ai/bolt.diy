import { NextResponse } from "next/server";

export async function GET() {
  const appId = process.env.GITHUB_APP_ID;
  const redirectUrl = `https://github.com/apps/${appId}/installations/new`;
  return NextResponse.redirect(redirectUrl);
}

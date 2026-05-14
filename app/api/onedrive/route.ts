import { NextRequest, NextResponse } from "next/server";

const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID;
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const ONEDRIVE_FOLDER_PATH = process.env.ONEDRIVE_FOLDER_PATH || "Maier KI Agenten";

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const tokenUrl = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: AZURE_CLIENT_ID!,
      client_secret: AZURE_CLIENT_SECRET!,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }).toString(),
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Failed to get access token");
  }

  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return accessToken;
}

async function getOneDriveFiles(folderName: string): Promise<any[]> {
  const token = await getAccessToken();

  try {
    const driveResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me/drive/root/children",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const driveData = await driveResponse.json();

    const kiFolder = driveData.value?.find(
      (item: any) => item.name === ONEDRIVE_FOLDER_PATH && item.folder
    );
    if (!kiFolder) throw new Error("KI folder not found");

    const folderResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${kiFolder.id}/children?$filter=name eq '${folderName}'`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const folderData = await folderResponse.json();

    const targetFolder = folderData.value?.[0];
    if (!targetFolder) throw new Error(`Folder ${folderName} not found`);

    const filesResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${targetFolder.id}/children`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const filesData = await filesResponse.json();

    const files = await Promise.all(
      (filesData.value || []).map(async (file: any) => {
        const contentResponse = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/items/${file.id}/content`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const content = await contentResponse.text();

        return {
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.file?.mimeType || "unknown",
          modified: file.lastModifiedDateTime,
          content: content.substring(0, 5000),
        };
      })
    );

    return files;
  } catch (error) {
    console.error("OneDrive API Error:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agent = searchParams.get("agent");

    if (!agent) {
      return NextResponse.json(
        { error: "Missing agent parameter" },
        { status: 400 }
      );
    }

    const folderMap: { [key: string]: string } = {
      orchestrator: "Allgemein",
      controlling: "Controlling",
      filialen: "Filialmanagement",
      admin: "Administration",
      catering: "Catering",
    };

    const folderName = folderMap[agent] || "Allgemein";
    const files = await getOneDriveFiles(folderName);

    return NextResponse.json({
      success: true,
      agent,
      folder: folderName,
      fileCount: files.length,
      files,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


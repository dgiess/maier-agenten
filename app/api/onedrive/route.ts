import { NextRequest, NextResponse } from "next/server";

const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID;
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const ONEDRIVE_FOLDER_PATH = process.env.ONEDRIVE_FOLDER_PATH || "Maier KI Agenten";

// Sicherheits-Filter
const ALLOWED_FILE_TYPES = [".xlsx", ".csv", ".docx", ".pdf", ".txt"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

function isFileAllowed(fileName: string, fileSize: number): boolean {
  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    console.warn(`File ${fileName} exceeds max size of 5MB`);
    return false;
  }

  // Check file extension
  const extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_FILE_TYPES.includes(extension)) {
    console.warn(`File ${fileName} has disallowed extension: ${extension}`);
    return false;
  }

  return true;
}

async function getOneDriveFilesRecursive(
  token: string,
  itemId: string,
  maxFiles: number = 100
): Promise<any[]> {
  const files: any[] = [];

  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/children?$top=200`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();

    if (!data.value) return files;

    for (const item of data.value) {
      if (files.length >= maxFiles) break;

      // If it's a folder, recursively get files
      if (item.folder) {
        const subFiles = await getOneDriveFilesRecursive(token, item.id, maxFiles - files.length);
        files.push(...subFiles);
      } else if (item.file) {
        // Check if file is allowed
        if (isFileAllowed(item.name, item.size)) {
          try {
            const contentResponse = await fetch(
              `https://graph.microsoft.com/v1.0/me/drive/items/${item.id}/content`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const content = await contentResponse.text();

            files.push({
              id: item.id,
              name: item.name,
              size: item.size,
              type: item.file?.mimeType || "unknown",
              modified: item.lastModifiedDateTime,
              content: content.substring(0, 5000),
            });
          } catch (error) {
            console.error(`Failed to read file ${item.name}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error reading OneDrive folder:", error);
  }

  return files;
}

async function getOneDriveFiles(folderName: string): Promise<any[]> {
  const token = await getAccessToken();

  try {
    // Get KI folder
    const driveResponse = await fetch(
      "https://graph.microsoft.com/v1.0/me/drive/root/children",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const driveData = await driveResponse.json();

    const kiFolder = driveData.value?.find(
      (item: any) => item.name === ONEDRIVE_FOLDER_PATH && item.folder
    );
    if (!kiFolder) throw new Error("KI folder not found");

    // Get agent-specific folder
    const folderResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${kiFolder.id}/children?$filter=name eq '${folderName}'`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const folderData = await folderResponse.json();

    const targetFolder = folderData.value?.[0];
    if (!targetFolder) throw new Error(`Folder ${folderName} not found`);

    // Recursively get all files from folder and subfolders
    const files = await getOneDriveFilesRecursive(token, targetFolder.id);

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
      filters: {
        allowedTypes: ALLOWED_FILE_TYPES,
        maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

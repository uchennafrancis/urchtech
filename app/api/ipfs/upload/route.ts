import { NextRequest, NextResponse } from "next/server";
import { uploadJSONToIPFS, uploadFileToIPFS, buildPropertyMetadata } from "@/lib/pinata";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { metadata, name } = body;
      const ipfsURI = await uploadJSONToIPFS(metadata, name || "willow-metadata");
      return NextResponse.json({ ipfsURI, ipfsHash: ipfsURI.replace("ipfs://", "") });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file     = formData.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

      const buffer   = Buffer.from(await file.arrayBuffer());
      const ipfsURI  = await uploadFileToIPFS(buffer, file.name, file.type);
      return NextResponse.json({ ipfsURI, ipfsHash: ipfsURI.replace("ipfs://", "") });
    }

    // Build and upload full property NFT metadata
    const body = await req.json();
    const metadata  = buildPropertyMetadata(body);
    const ipfsURI   = await uploadJSONToIPFS(metadata, `${body.willowPropertyId}-metadata`);
    return NextResponse.json({ ipfsURI, ipfsHash: ipfsURI.replace("ipfs://", ""), metadata });
  } catch (err) {
    console.error("[IPFS Upload]", err);
    return NextResponse.json({ error: "IPFS upload failed" }, { status: 500 });
  }
}

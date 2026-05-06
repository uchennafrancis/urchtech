import axios from "axios";
import FormData from "form-data";

const PINATA_API_KEY    = process.env.PINATA_API_KEY!;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY!;
const GATEWAY           = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";

export async function uploadJSONToIPFS(metadata: object, name: string): Promise<string> {
  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    { pinataContent: metadata, pinataMetadata: { name } },
    {
      headers: {
        pinata_api_key:        PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
        "Content-Type":        "application/json",
      },
    }
  );
  return `ipfs://${response.data.IpfsHash}`;
}

export async function uploadFileToIPFS(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  const form = new FormData();
  form.append("file", fileBuffer, { filename: fileName, contentType: mimeType });
  form.append("pinataMetadata", JSON.stringify({ name: fileName }));

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    form,
    {
      headers: {
        ...form.getHeaders(),
        pinata_api_key:        PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      maxBodyLength: Infinity,
    }
  );
  return `ipfs://${response.data.IpfsHash}`;
}

export function ipfsToHTTP(ipfsURI: string): string {
  return ipfsURI.replace("ipfs://", `${GATEWAY}/ipfs/`);
}

export function buildPropertyMetadata(property: {
  name: string;
  description: string;
  imageIPFS: string;
  willowPropertyId: string;
  city: string;
  state: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  floorArea?: number;
  yearBuilt?: number;
  uosScore?: number;
  isVerified?: boolean;
  titleType?: string;
  documents?: Array<{ type: string; ipfs: string }>;
}) {
  return {
    name:         property.name,
    description:  property.description,
    image:        property.imageIPFS,
    external_url: `https://willow.ng/property/${property.willowPropertyId}`,
    attributes: [
      { trait_type: "City",              value: property.city },
      { trait_type: "State",             value: property.state },
      { trait_type: "Property Type",     value: property.propertyType },
      { trait_type: "Bedrooms",          value: property.bedrooms   ?? 0 },
      { trait_type: "Bathrooms",         value: property.bathrooms  ?? 0 },
      { trait_type: "Floor Area (sqm)",  value: property.floorArea  ?? 0 },
      { trait_type: "Year Built",        value: property.yearBuilt  ?? 0 },
      { trait_type: "UOS Score",         value: property.uosScore   ?? 0 },
      { trait_type: "Verified",          value: property.isVerified ? "Yes" : "No" },
      { trait_type: "Title Type",        value: property.titleType  ?? "Certificate of Occupancy" },
    ],
    documents: property.documents ?? [],
  };
}

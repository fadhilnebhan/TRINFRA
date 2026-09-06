export interface ApiLandowner {
  id: string;
  referenceNumber: string;
  fullName: string;
  phone: string;
  email: string;
  ownerType?: string;
  preferredCommunication?: string;
  district: string;
  localBody?: string;
  locality?: string;
  approximateArea: number;
  areaUnit?: string;
  ownershipStatus: string;
  poolingInterest: string;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
  parcels?: ApiLandParcel[];
  documents?: ApiDocument[];
  adminNotes?: ApiAdminNote[];
}

export interface ApiLandParcel {
  id: string;
  surveyNumber?: string;
  district?: string;
  locality?: string;
  approximateArea?: number;
  areaUnit?: string;
}

export interface ApiDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  uploadedAt?: string;
  verificationStatus?: string;
}

export interface ApiAdminNote {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt?: string;
}

export interface ApiActivity {
  id: string;
  type?: string;
  title: string;
  reference?: string;
  message?: string;
  createdAt: string;
}

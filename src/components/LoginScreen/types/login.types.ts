export type AvailableRole = {
  roleId: number;
  name: string;
  isPrimary: boolean;
};

export type Permissions = {
  global: Record<string, string[]>;
  branchMode: Record<string, string[]>;
};


export type StudentCourse = {
  admissionId: number;
  roleName: string;
  roleLevel: string;
  admissionNumber: string;

  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;

  gender: string | null;
  city: string | null;
  state: string | null;
  pincode: number | null;

  whatsappNumber: string | null;

  parentOrGuardianName: string | null;
  parentOrGuardianNumber: string | null;

  classTiming: string | null;
  qualification: string | null;
  academicYear: number | null;

  branchId?: string | null;
  branchName: string | null;

  courseId: number | null;
  courseName: string | null;

  batchId: number | null;
  batchName: string | null;

  dateOfBirth: string | null;
  dateOfAdmission: string | null;

  schoolName: string | null;
  standard: string | null;
  collegeName: string | null;
  department: string | null;

  organisationName: string | null;
  designation: string | null;

  photoName: string | null;

  address1: string | null;
  address2: string | null;

  totalFees: string | null;
  discountPercentage: string | null;

  certificateCollectedOrNot: number | null;
};

export type StudentAuth = {
  userId: string;
  userType: 'STUDENT';

  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;

  courses: StudentCourse[];
   photoName: string | null
  permissions?: Permissions;
};

export type StaffAuth = {
    userType: 'STAFF'

    id: string
    firstName: string
    lastName: string
    email: string
    userName: string | null
    phoneNumber: string | null
    photoName: string | null

    roleId: number
    roleName: string
    roleLevel: string

    adminId: string | null
    staffId: number | null

    staffCode: string | null
    qualification: string | null
    gender: string | null
    designation: string | null
    staffTimings: unknown

    city: string | null

    branchId: string | null
    branchName: string | null
    branchCode: string | null
    branchAddress: string | null
    branchPhoneNumber: string | null
    branchIsActive: number | null

         roleConfig?: {
    isBranchScoped?: boolean;
  };
  availableRoles: AvailableRole[];
  permissions?: Permissions;
}

import type { Session } from '@/session';

export const mockSession: Session[] = [
  {
  token: 'mock-token-12345',
  user: {
    id: 1,
    uid: 'fengptu',
    nontri_account: 'fengptu',
    other_prefix: 'ผศ.',
    prefix: 'นางสาว',
    fullname: 'วรัญญา อรรถเสนา',
    thai_name: 'วรัญญา',
    thai_surname: 'อรรถเสนา',
    gender: 'female',
    position: 'หัวหน้าภาควิชาวิศวกรรมคอมพิวเตอร์',
    faculty: 'คณะวิศวกรรมศาสตร์',
    department: 'ภาควิชาวิศวกรรมคอมพิวเตอร์',
    employment_start_date: '2014-01-15',
    // สำหรับ approver
    approve_position: 'หัวหน้าภาควิชาวิศวกรรมคอมพิวเตอร์',
    role: [
      {
        role_id: 1,
        thai_name: 'ผู้อนุมัติลำดับที่ 1',
        priority: 1,
        visibility: 'show',
      },
      {
        role_id: 2,
        thai_name: 'ผู้อนุมัติลำดับที่ 2',
        priority: 2,
        visibility: 'show',
      },
      {
        role_id: 2,
        thai_name: 'ผู้ลา',
        priority: 1,
        visibility: 'show',
      },
    ],
  },
},
{
  token: 'mock-token-67890',
  user: {
    id: 2,
    uid: 'fengpny',
    nontri_account: 'fengpny',
    other_prefix: null,
    prefix: 'นางสาว',
    fullname: 'เพชรน้อย ยอดอยู่ดี',
        thai_name: 'เพชรน้อย',
    thai_surname: 'ยอดอยู่ดี',
    gender: 'female',
    position: 'หัวหน้าสำนักงานเลขานุการ คณะฯ',
    faculty: 'คณะวิศวกรรมศาสตร์',
    department: 'สำนักงานเลขานุการ',
    employment_start_date: '2014-01-15',
    // สำหรับ approver
    approve_position: 'รักษาการแทนคณบดีคณะวิศวกรรมศาสตร์',
    role: [
      {
        role_id: 1,
        thai_name: 'ผู้อนุมัติลำดับที่ 1',
        priority: 1,
        visibility: 'show',
      },
      {
        role_id: 2,
        thai_name: 'ผู้อนุมัติลำดับที่ 2',
        priority: 2,
        visibility: 'show',
      },
      {
        role_id: 2,
        thai_name: 'ผู้ลา',
        priority: 1,
        visibility: 'show',
      },
      {
        role_id: 2,
        thai_name: 'ผู้ดูแลระบบ',
        priority: 1,
        visibility: 'show',
      },
    ],
  },
},
{
  token: 'mock-token-10293',
  user: {
    id: 2,
    uid: 'theerawat',
    nontri_account: 'theerawat',
    other_prefix: 'อ.',
    prefix: 'นาย',
    fullname: 'ธีรวัฒน์ หวายฤทธิ์',
    thai_name: 'ธีรวัฒน์',
    thai_surname: 'หวายฤทธิ์',
    gender: 'male',
    position: 'อาจารย์',
    faculty: 'คณะวิศวกรรมศาสตร์',
    department: 'ภาควิชาวิศวกรรมคอมพิวเตอร์',
    employment_start_date: '2024-03-01',
    // สำหรับ approver
    approve_position: '',
    role: [
      {
        role_id: 2,
        thai_name: 'ผู้ลา',
        priority: 1,
        visibility: 'show',
      },
    ],
  },
}
];
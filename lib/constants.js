'use strict';

/**
 * Danh muc dung chung cho CA server va giao dien.
 *
 * Truoc day danh sach nhom tuoi duoc go cung o hai noi: cac <option> trong
 * index.html va mot Set trong routes/content.js. Hai ben lech nhau nen ba
 * nhom tuoi (<18, 56-70, >70) bi tu choi im lang — chan dung nhom nguoi cao
 * tuoi, la nhom quy nhat voi mot kho phuong ngu.
 *
 * Gio giao dien nap danh muc tu /api/filters nen khong the lech nua.
 */

const PROVINCES = [
  'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế'
];

const AGE_GROUPS = [
  { value: '<18',   label: 'Dưới 18 tuổi' },
  { value: '18-35', label: '18 – 35 tuổi' },
  { value: '36-55', label: '36 – 55 tuổi' },
  { value: '56-70', label: '56 – 70 tuổi' },
  { value: '>70',   label: 'Trên 70 tuổi' }
];

const GENDERS = [
  { value: 'Nam',  label: 'Nam' },
  { value: 'Nữ',   label: 'Nữ' },
  { value: 'Khác', label: 'Khác' }
];

const TOPICS = [
  { value: 'Lịch sử văn hóa',    label: 'Lịch sử văn hóa (truyền thuyết, chuyện cổ, di tích…)' },
  { value: 'Giọng ca đặc trưng', label: 'Giọng ca đặc trưng (Ví, Giặm, Ca Huế, hò sông nước…)' },
  { value: 'Tổng quan vùng',     label: 'Tổng quan vùng (đời sống, phong tục, thói quen…)' },
  { value: 'Lời ăn tiếng nói',   label: 'Lời ăn tiếng nói hằng ngày' },
  { value: 'Nghề truyền thống',  label: 'Nghề truyền thống' }
];

// Du lieu cu dung ten khac cho cung mot chu de; gop lai khi thong ke
const TOPIC_ALIASES = {
  'Lịch sử & Văn hóa': 'Lịch sử văn hóa',
  'Giọng ca đặc trưng (Ví Giặm, Ca Huế...)': 'Giọng ca đặc trưng'
};

const values = (list) => list.map((item) => item.value);

const AGE_VALUES = new Set(values(AGE_GROUPS));
const GENDER_VALUES = new Set(values(GENDERS));
const TOPIC_VALUES = new Set(values(TOPICS));
const PROVINCE_VALUES = new Set(PROVINCES);

/** Quy ten chu de cu ve ten chuan. */
const normalizeTopic = (topic) => TOPIC_ALIASES[topic] || topic;

module.exports = {
  PROVINCES, AGE_GROUPS, GENDERS, TOPICS, TOPIC_ALIASES,
  PROVINCE_VALUES, AGE_VALUES, GENDER_VALUES, TOPIC_VALUES,
  normalizeTopic
};

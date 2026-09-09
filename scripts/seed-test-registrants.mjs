// One-off test data seeder — POSTs plausible registrants to a running local dev server.
// ponytail: throwaway script, not part of app. Delete after use or leave in scripts/.
const BASE = process.env.SEED_BASE_URL || 'http://localhost:3000';

const boys = ['Ahmad Fajar Ramadhan', 'Muhammad Rizky Pratama', 'Bilal Akbar Nugroho', 'Daffa Arkan Saputra', 'Farrel Hakim Wijaya', 'Rafael Adi Kusuma', 'Zaidan Malik Firmansyah', 'Ilham Nur Setiawan', 'Rayhan Fadillah Putra', 'Naufal Hidayat Santoso'];
const girls = ['Aisyah Putri Ramadhani', 'Siti Nur Azizah', 'Khansa Aulia Rahma', 'Fatimah Zahra Anggraini', 'Nayla Zahira Wulandari', 'Keisha Ayu Lestari', 'Salma Nabila Kusumawati', 'Alya Ramadhani Safitri', 'Zahra Amelia Pertiwi', 'Cinta Aulia Maharani'];
const schools = ['TK Bina Nusa', 'TK Islam Al-Ikhlas', 'TK Aisyiyah Rajeg', 'TK Pertiwi Mekarsari', 'RA Nurul Iman', 'TK Ceria Kids', 'PAUD Melati', 'TK Tunas Bangsa', 'TK Al-Hidayah', 'TK Kasih Bunda'];

function randomBirthDate() {
  const age = 5 + Math.floor(Math.random() * 4); // 5..8
  const now = new Date();
  const year = now.getFullYear() - age;
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 27);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function randomPhone() {
  let n = '08';
  for (let i = 0; i < 10; i++) n += Math.floor(Math.random() * 10);
  return n;
}

async function seedOne(name, gender) {
  const body = {
    full_name: name,
    gender,
    birth_date: randomBirthDate(),
    education_level: 'SD',
    previous_school: schools[Math.floor(Math.random() * schools.length)],
    phone: randomPhone(),
  };
  const res = await fetch(`${BASE}/api/registrants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`FAILED ${name}:`, data.error || data);
    return null;
  }
  console.log(`OK ${data.registration_number || '?'} — ${name}`);
  return data;
}

const all = [...boys.map((n) => [n, 'Laki-laki']), ...girls.map((n) => [n, 'Perempuan'])];

for (const [name, gender] of all) {
  await seedOne(name, gender);
}

import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // UNCOMMENT BARIS INI DI KOMPUTER LOKAL SETELAH 'npm install xlsx'
import { 
  User, Users, BookOpen, Calendar, 
  ClipboardList, PenTool, Heart, 
  BarChart2, Menu, Plus, Trash2, 
  Printer, ChevronDown, Download, Upload, FileSpreadsheet
} from 'lucide-react';

// --- UTILS & DATA STRUCTURE ---

const initialIdentity = {
  schoolName: '',
  principalName: '', // Field Kepala Sekolah
  subject: '',
  teacherName: '',
  nip: '',
  semester: 'Ganjil',
  academicYear: '2025/2026',
};

// Fungsi hitung nilai
const calculateFinalGrade = (student) => {
  const formativeScores = Object.values(student.formative || {}).map(v => parseInt(v)||0);
  const summativeScores = Object.values(student.summative || {}).map(v => parseInt(v)||0);

  const avgFormative = formativeScores.length ? formativeScores.reduce((a,b)=>a+b,0)/formativeScores.length : 0;
  const avgSummative = summativeScores.length ? summativeScores.reduce((a,b)=>a+b,0)/summativeScores.length : 0;

  return Math.round((avgFormative * 0.4) + (avgSummative * 0.6));
};

// --- SUB-COMPONENTS ---

const IdentitySection = ({ identity, setIdentity, classList, setClassList, selectedClass, setSelectedClass }) => {
  const [newClassInput, setNewClassInput] = useState('');

  const addClass = () => {
    if (newClassInput && !classList.includes(newClassInput)) {
      const newList = [...classList, newClassInput];
      setClassList(newList);
      if (!selectedClass) setSelectedClass(newClassInput);
      setNewClassInput('');
    }
  };

  const removeClass = (cls) => {
    const newList = classList.filter(c => c !== cls);
    setClassList(newList);
    if (selectedClass === cls) setSelectedClass(newList[0] || '');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">1. Identitas & Pengaturan Kelas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <h3 className="font-bold text-blue-600 flex items-center gap-2"><User size={18}/> Data Administrasi</h3>
          <div><label className="text-sm text-slate-500">Nama Sekolah</label><input type="text" className="w-full p-2 border rounded" value={identity.schoolName} onChange={e=>setIdentity({...identity, schoolName: e.target.value})} /></div>
          <div><label className="text-sm text-slate-500">Nama Kepala Sekolah</label><input type="text" className="w-full p-2 border rounded" placeholder="Nama Kepala Sekolah beserta gelar" value={identity.principalName} onChange={e=>setIdentity({...identity, principalName: e.target.value})} /></div>
          <div><label className="text-sm text-slate-500">Mata Pelajaran</label><input type="text" className="w-full p-2 border rounded" value={identity.subject} onChange={e=>setIdentity({...identity, subject: e.target.value})} /></div>
          <div><label className="text-sm text-slate-500">Nama Guru</label><input type="text" className="w-full p-2 border rounded" value={identity.teacherName} onChange={e=>setIdentity({...identity, teacherName: e.target.value})} /></div>
          <div><label className="text-sm text-slate-500">NIP</label><input type="text" className="w-full p-2 border rounded" value={identity.nip} onChange={e=>setIdentity({...identity, nip: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-sm text-slate-500">Semester</label>
              <select className="w-full p-2 border rounded" value={identity.semester} onChange={e=>setIdentity({...identity, semester: e.target.value})}>
                <option>Ganjil</option><option>Genap</option>
              </select>
            </div>
            <div><label className="text-sm text-slate-500">Tahun Pelajaran</label><input type="text" className="w-full p-2 border rounded" value={identity.academicYear} onChange={e=>setIdentity({...identity, academicYear: e.target.value})} /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <h3 className="font-bold text-green-600 flex items-center gap-2"><Users size={18}/> Manajemen Kelas</h3>
          <p className="text-sm text-slate-500">Tambahkan daftar kelas yang Anda ampu.</p>
          <div className="flex gap-2">
            <input type="text" className="flex-1 p-2 border rounded" placeholder="Nama Kelas (Contoh: X-A)" value={newClassInput} onChange={e=>setNewClassInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && addClass()} />
            <button onClick={addClass} className="bg-green-600 text-white px-4 rounded hover:bg-green-700"><Plus/></button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {classList.length === 0 && <span className="text-slate-400 text-sm italic">Belum ada kelas.</span>}
            {classList.map(cls => (
              <div key={cls} className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2 border border-slate-300">
                <span className="font-medium">{cls}</span>
                <button onClick={() => removeClass(cls)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded">
            <strong>Info:</strong> Kelas yang Anda tambahkan di sini akan menjadi filter utama di halaman Penilaian dan Absensi.
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceSection = ({ selectedClass, students, onUpdateStudents }) => {
  const [newStudent, setNewStudent] = useState({ name: '', nim: '', nisn: '', gender: 'L' });

  if (!selectedClass) return <div className="p-10 text-center text-slate-500">Silakan pilih/tambah kelas terlebih dahulu di menu Identitas.</div>;

  const addStudent = () => {
    if (!newStudent.name) return;
    const updated = [...students, { 
      ...newStudent, 
      id: Date.now(),
      attendance: { presentToday: false, s: 0, i: 0, a: 0 }
    }];
    onUpdateStudents(updated);
    setNewStudent({ name: '', nim: '', nisn: '', gender: 'L' });
  };

  const updateAttVal = (id, field, val) => {
    const updated = students.map(s => s.id === id ? { ...s, attendance: { ...s.attendance, [field]: val } } : s);
    onUpdateStudents(updated);
  };

  // --- FITUR EXCEL ---

  // 1. Download Template Excel
  const handleDownloadTemplate = () => {
    // Cek ketersediaan library XLSX (Untuk Preview vs Lokal)
    if (typeof XLSX === 'undefined') {
      alert("FITUR INI BELUM AKTIF DI PREVIEW.\n\nUntuk menggunakannya di komputer lokal:\n1. Jalankan 'npm install xlsx'\n2. Buka file App.jsx\n3. Uncomment baris 'import * as XLSX from xlsx'");
      return;
    }

    // Data contoh agar guru tahu formatnya
    const templateData = [
      { No: 1, NISN: "1234567890", NIM: "1001", Nama: "Ahmad Santoso", Gender: "L" },
      { No: 2, NISN: "0987654321", NIM: "1002", Nama: "Budi Pratama", Gender: "L" },
      { No: 3, NISN: "1122334455", NIM: "1003", Nama: "Citra Lestari", Gender: "P" },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Siswa");
    XLSX.writeFile(wb, "Template_Input_Siswa.xlsx");
  };

  // 2. Import Excel
  const handleImportExcel = (e) => {
    // Cek ketersediaan library XLSX (Untuk Preview vs Lokal)
    if (typeof XLSX === 'undefined') {
      alert("FITUR INI BELUM AKTIF DI PREVIEW.\n\nUntuk menggunakannya di komputer lokal:\n1. Jalankan 'npm install xlsx'\n2. Buka file App.jsx\n3. Uncomment baris 'import * as XLSX from xlsx'");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsName = wb.SheetNames[0]; // Ambil sheet pertama
      const ws = wb.Sheets[wsName];
      const data = XLSX.utils.sheet_to_json(ws);

      if (data.length === 0) {
        alert("File Excel kosong atau format tidak terbaca.");
        return;
      }

      // Mapping data dari Excel ke Format Aplikasi
      const importedStudents = data.map((row, index) => ({
        id: Date.now() + index + Math.random(), // Buat ID unik
        name: row['Nama'] || row['nama'] || row['NAMA'] || 'Tanpa Nama',
        nisn: row['NISN'] || row['nisn'] || '-',
        nim: row['NIM'] || row['nim'] || '-',
        gender: (row['Gender'] || row['gender'] || 'L').toUpperCase(),
        attendance: { presentToday: false, s: 0, i: 0, a: 0 },
        // Siapkan objek nilai kosong agar tidak error
        formative: {}, 
        summative: {}, 
        attitude: {} 
      }));

      // Gabungkan dengan data yg sudah ada
      if (window.confirm(`Ditemukan ${importedStudents.length} data siswa. Apakah ingin ditambahkan ke kelas ini?`)) {
        onUpdateStudents([...students, ...importedStudents]);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Reset input file
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b pb-2">
         <h2 className="text-2xl font-bold text-slate-800">2. Daftar Hadir & Data Siswa</h2>
         <div className="bg-blue-100 px-4 py-1 rounded-lg font-bold text-blue-800">Kelas: {selectedClass}</div>
      </div>

      {/* --- BOX IMPORT EXCEL --- */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex flex-col md:flex-row gap-4 items-center justify-between mb-6 shadow-sm">
        <div className="flex items-center gap-3 text-green-800">
           <div className="bg-green-100 p-2 rounded-full"><FileSpreadsheet size={24}/></div>
           <div>
             <h4 className="font-bold text-sm">Import Data dari Excel</h4>
             <p className="text-xs text-green-700">Gunakan template yang disediakan agar format sesuai.</p>
           </div>
        </div>
        <div className="flex gap-2">
          {/* Tombol Download */}
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 bg-white border border-green-600 text-green-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-50 transition-colors"
          >
            <Download size={16}/> Download Template
          </button>
          
          {/* Tombol Upload (Input File tersembunyi) */}
          <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 cursor-pointer transition-colors shadow-sm">
            <Upload size={16}/> Upload Excel
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              onChange={handleImportExcel}
            />
          </label>
        </div>
      </div>

      {/* Input Siswa Manual */}
      <div className="bg-slate-50 p-4 rounded-lg border flex flex-wrap gap-2 items-end">
        <div className="w-32"><label className="text-xs font-bold">NISN</label><input value={newStudent.nisn} onChange={e=>setNewStudent({...newStudent, nisn:e.target.value})} className="w-full p-2 border rounded text-sm"/></div>
        <div className="w-32"><label className="text-xs font-bold">NIM</label><input value={newStudent.nim} onChange={e=>setNewStudent({...newStudent, nim:e.target.value})} className="w-full p-2 border rounded text-sm"/></div>
        <div className="flex-1"><label className="text-xs font-bold">Nama Siswa</label><input value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name:e.target.value})} className="w-full p-2 border rounded text-sm" placeholder="Nama Lengkap..."/></div>
        <div className="w-24"><label className="text-xs font-bold">L/P</label>
          <select value={newStudent.gender} onChange={e=>setNewStudent({...newStudent, gender:e.target.value})} className="w-full p-2 border rounded text-sm">
            <option value="L">L</option><option value="P">P</option>
          </select>
        </div>
        <button onClick={addStudent} className="bg-blue-600 text-white p-2 rounded w-10 h-10 flex items-center justify-center hover:bg-blue-700"><Plus/></button>
      </div>

      {/* Tabel Presensi */}
      <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-white uppercase text-xs">
            <tr>
              <th className="p-3 w-10">No</th>
              <th className="p-3 w-24">NISN</th>
              <th className="p-3 w-24">NIM</th>
              <th className="p-3">Nama Siswa</th>
              <th className="p-3 w-10 text-center">L/P</th>
              <th className="p-3 w-20 text-center bg-blue-900">Hadir</th>
              <th className="p-3 w-16 text-center bg-yellow-700">Sakit</th>
              <th className="p-3 w-16 text-center bg-yellow-700">Izin</th>
              <th className="p-3 w-16 text-center bg-red-700">Alpha</th>
              <th className="p-3 w-10 text-center"><Trash2 size={14}/></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((s, idx) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="p-3 text-center">{idx+1}</td>
                <td className="p-3">{s.nisn}</td>
                <td className="p-3">{s.nim}</td>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3 text-center">{s.gender}</td>
                <td className="p-3 text-center bg-blue-50">
                  <input type="checkbox" checked={s.attendance?.presentToday || false} onChange={(e)=>updateAttVal(s.id, 'presentToday', e.target.checked)} className="w-5 h-5 accent-blue-600"/>
                </td>
                <td className="p-2"><input type="number" value={s.attendance?.s || 0} onChange={e=>updateAttVal(s.id, 's', e.target.value)} className="w-full text-center border rounded p-1"/></td>
                <td className="p-2"><input type="number" value={s.attendance?.i || 0} onChange={e=>updateAttVal(s.id, 'i', e.target.value)} className="w-full text-center border rounded p-1"/></td>
                <td className="p-2"><input type="number" value={s.attendance?.a || 0} onChange={e=>updateAttVal(s.id, 'a', e.target.value)} className="w-full text-center border rounded p-1"/></td>
                <td className="p-2 text-center text-red-400 cursor-pointer" onClick={()=>{
                  if(window.confirm('Hapus siswa ini?')) onUpdateStudents(students.filter(x => x.id !== s.id));
                }}><Trash2 size={16}/></td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan="10" className="p-4 text-center text-slate-400">Belum ada siswa di kelas {selectedClass}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CurriculumSection = ({ identity, curriculumData, setCurriculumData }) => {
  const [newItem, setNewItem] = useState({ scope: '', tp: '', kktp: '' });
  
  const addItem = () => {
    if(newItem.scope) {
      setCurriculumData([...curriculumData, { ...newItem, id: Date.now() }]);
      setNewItem({ scope: '', tp: '', kktp: '' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">3. Lingkup Materi & TP</h2>
      <div className="bg-slate-100 p-4 rounded text-sm grid grid-cols-2 gap-4">
        <div><b>Sekolah:</b> {identity.schoolName}</div>
        <div><b>Mapel:</b> {identity.subject}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input placeholder="Lingkup Materi" value={newItem.scope} onChange={e=>setNewItem({...newItem, scope: e.target.value})} className="p-2 border rounded"/>
          <input placeholder="Tujuan Pembelajaran (TP)" value={newItem.tp} onChange={e=>setNewItem({...newItem, tp: e.target.value})} className="p-2 border rounded"/>
          <div className="flex gap-2">
              <input placeholder="KKTP (Deskripsi/Nilai)" value={newItem.kktp} onChange={e=>setNewItem({...newItem, kktp: e.target.value})} className="p-2 border rounded flex-1"/>
              <button onClick={addItem} className="bg-blue-600 text-white px-4 rounded"><Plus/></button>
          </div>
      </div>

      <table className="w-full text-sm border-collapse border border-slate-300">
          <thead className="bg-slate-200">
              <tr>
                  <th className="border p-2 w-10">No</th>
                  <th className="border p-2">Lingkup Materi</th>
                  <th className="border p-2">Tujuan Pembelajaran</th>
                  <th className="border p-2">KKTP</th>
                  <th className="border p-2 w-10">Act</th>
              </tr>
          </thead>
          <tbody>
              {curriculumData.map((item, idx) => (
                  <tr key={item.id}>
                      <td className="border p-2 text-center">{idx+1}</td>
                      <td className="border p-2">{item.scope}</td>
                      <td className="border p-2">{item.tp}</td>
                      <td className="border p-2">{item.kktp}</td>
                      <td className="border p-2 text-center text-red-500 cursor-pointer" onClick={()=>setCurriculumData(curriculumData.filter(x=>x.id!==item.id))}><Trash2 size={16}/></td>
                  </tr>
              ))}
          </tbody>
      </table>
    </div>
  );
};

const JournalSection = ({ selectedClass, curriculumData, journalData, setJournalData }) => {
  const [entry, setEntry] = useState({ date: '', time: '', scope: '', tp: '', activity: '', reflection: '', followup: '' });
  
  const addJournal = () => {
      setJournalData([...journalData, { ...entry, id: Date.now(), class: selectedClass || 'Umum' }]);
      setEntry({ ...entry, activity: '', reflection: '', followup: '' }); 
  };

  return (
    <div className="space-y-6 animate-fadeIn">
       <div className="flex justify-between items-center border-b pb-2">
         <h2 className="text-2xl font-bold text-slate-800">4. Jurnal Harian Guru</h2>
         <div className="bg-blue-100 px-4 py-1 rounded-lg font-bold text-blue-800">Kelas: {selectedClass || 'Semua'}</div>
      </div>

      <div className="bg-white p-4 rounded shadow border grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-xs font-bold">Hari/Tanggal</label><input type="date" className="w-full p-2 border rounded" value={entry.date} onChange={e=>setEntry({...entry, date:e.target.value})}/></div>
          <div><label className="text-xs font-bold">Jam Pelajaran</label><input type="text" className="w-full p-2 border rounded" placeholder="Misal: 1-2" value={entry.time} onChange={e=>setEntry({...entry, time:e.target.value})}/></div>
          
          <div className="col-span-2"><label className="text-xs font-bold">Lingkup Materi</label>
              <select className="w-full p-2 border rounded" value={entry.scope} onChange={e=>setEntry({...entry, scope:e.target.value})}>
                  <option value="">-- Pilih Materi --</option>
                  {curriculumData.map(c => <option key={c.id} value={c.scope}>{c.scope}</option>)}
              </select>
          </div>
          <div className="col-span-2"><label className="text-xs font-bold">Tujuan Pembelajaran</label><input type="text" className="w-full p-2 border rounded" value={entry.tp} onChange={e=>setEntry({...entry, tp:e.target.value})}/></div>
          
          <div className="col-span-2"><label className="text-xs font-bold">Kegiatan Pembelajaran</label><textarea className="w-full p-2 border rounded h-20" value={entry.activity} onChange={e=>setEntry({...entry, activity:e.target.value})}></textarea></div>
          <div><label className="text-xs font-bold">Refleksi</label><textarea className="w-full p-2 border rounded h-16" value={entry.reflection} onChange={e=>setEntry({...entry, reflection:e.target.value})}></textarea></div>
          <div><label className="text-xs font-bold">Tindak Lanjut</label><textarea className="w-full p-2 border rounded h-16" value={entry.followup} onChange={e=>setEntry({...entry, followup:e.target.value})}></textarea></div>
          
          <div className="col-span-2 text-right">
              <button onClick={addJournal} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700">Simpan Jurnal</button>
          </div>
      </div>

      <h3 className="font-bold text-slate-700 mt-6">Riwayat Jurnal</h3>
      <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100">
                  <tr>
                      <th className="border p-2">Tanggal</th>
                      <th className="border p-2">Kelas</th>
                      <th className="border p-2">Materi</th>
                      <th className="border p-2">Kegiatan</th>
                      <th className="border p-2">Refleksi</th>
                      <th className="border p-2">TL</th>
                      <th className="border p-2">Act</th>
                  </tr>
              </thead>
              <tbody>
                  {journalData.filter(j => !selectedClass || j.class === selectedClass).map(j => (
                      <tr key={j.id} className="bg-white">
                          <td className="border p-2 whitespace-nowrap">{j.date}<br/><span className="text-slate-500">{j.time}</span></td>
                          <td className="border p-2 font-bold">{j.class}</td>
                          <td className="border p-2">{j.scope}</td>
                          <td className="border p-2 max-w-xs truncate hover:whitespace-normal">{j.activity}</td>
                          <td className="border p-2 max-w-xs truncate">{j.reflection}</td>
                          <td className="border p-2">{j.followup}</td>
                          <td className="border p-2 text-red-500 cursor-pointer" onClick={()=>setJournalData(journalData.filter(x=>x.id!==j.id))}><Trash2 size={14}/></td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};

const AssessmentSection = ({ type, selectedClass, students, onUpdateStudents }) => {
  if (!selectedClass) return <div className="p-10 text-center text-slate-500">Pilih Kelas Terlebih Dahulu.</div>;

  // Title Map untuk mengubah ID data (inggris) menjadi Judul (indo)
  const titleMap = {
    formative: 'Formatif',
    summative: 'Sumatif',
    attitude: 'Sikap & Keaktifan'
  };

  let columns = [];
  if (type === 'formative') columns = ['TP1', 'TP2', 'TP3', 'TP4', 'TP5'];
  if (type === 'summative') columns = ['LM1', 'LM2', 'LM3', 'LM4', 'STS', 'SAS'];
  if (type === 'attitude') columns = ['Religius', 'Jujur', 'Disiplin', 'Kerjasama', 'Kreatif'];

  const updateScore = (id, col, val) => {
      const student = students.find(s => s.id === id);
      const field = type; 
      const currentScores = student[field] || {};
      
      const updatedStudent = {
          ...student,
          [field]: { ...currentScores, [col]: val }
      };

      const updatedList = students.map(s => s.id === id ? updatedStudent : s);
      onUpdateStudents(updatedList);
  };

  return (
      <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-2xl font-bold text-slate-800 capitalize">5-7. Penilaian {titleMap[type]}</h2>
              <div className="bg-blue-100 px-4 py-1 rounded-lg font-bold text-blue-800">Kelas: {selectedClass}</div>
          </div>

          <div className="overflow-x-auto bg-white border rounded shadow-sm">
              <table className="w-full text-sm text-center border-collapse">
                  <thead className="bg-slate-700 text-white">
                      <tr>
                          <th className="p-3 text-left w-10">No</th>
                          <th className="p-3 text-left sticky left-0 bg-slate-700 z-10 w-48">Nama Siswa</th>
                          {columns.map(c => <th key={c} className="p-3 border-l border-slate-600 w-20">{c}</th>)}
                          {type !== 'attitude' && <th className="p-3 bg-slate-900 w-20">Rata-rata</th>}
                      </tr>
                  </thead>
                  <tbody>
                      {students.map((s, idx) => {
                          const scores = s[type] || {};
                          const vals = columns.map(c => parseInt(scores[c]) || 0);
                          const avg = vals.filter(v=>v>0).length ? (vals.reduce((a,b)=>a+b,0)/vals.filter(v=>v>0).length).toFixed(0) : 0;
                          
                          return (
                              <tr key={s.id} className="hover:bg-slate-50 border-b">
                                  <td className="p-3 text-left">{idx+1}</td>
                                  <td className="p-3 text-left font-medium sticky left-0 bg-white z-10 border-r">{s.name}</td>
                                  {columns.map(c => (
                                      <td key={c} className="p-1 border-r">
                                          <input 
                                              type={type==='attitude'?'text':'number'} 
                                              className="w-full text-center p-1 outline-none" 
                                              value={scores[c] || ''}
                                              placeholder="-"
                                              onChange={e=>updateScore(s.id, c, e.target.value)}
                                          />
                                      </td>
                                  ))}
                                  {type !== 'attitude' && <td className="p-3 font-bold bg-slate-100">{avg}</td>}
                              </tr>
                          )
                      })}
                  </tbody>
              </table>
          </div>
          {type === 'attitude' && <p className="text-sm text-slate-500 italic">*Isi dengan deskripsi singkat (SB/B/C/K) atau nilai angka.</p>}
      </div>
  )
};

const ReportSection = ({ identity, selectedClass, students }) => {
  if (!selectedClass) return <div className="p-10 text-center text-slate-500">Pilih Kelas Terlebih Dahulu.</div>;

  return (
      <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center border-b pb-2 print:hidden">
              <h2 className="text-2xl font-bold text-slate-800">8. Kelola Nilai Rapor</h2>
              <button onClick={()=>window.print()} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-900"><Printer size={16}/> Cetak</button>
          </div>

          <div className="hidden print:block text-center mb-6">
              <h1 className="text-xl font-bold">REKAPITULASI NILAI RAPOR</h1>
              <p>Tahun Pelajaran {identity.academicYear} - Semester {identity.semester}</p>
              <p>Kelas: {selectedClass}</p>
          </div>

          <div className="overflow-x-auto bg-white border rounded shadow-sm">
              <table className="w-full text-sm border-collapse border border-slate-300">
                  <thead className="bg-slate-800 text-white print:bg-white print:text-black">
                      <tr>
                          <th className="border p-2">No</th>
                          <th className="border p-2 text-left">NISN</th>
                          <th className="border p-2 text-left">Nama Siswa</th>
                          <th className="border p-2 w-16 text-center">Rata Formatif</th>
                          <th className="border p-2 w-16 text-center">Rata Sumatif</th>
                          <th className="border p-2 w-16 text-center bg-blue-900 text-white print:text-black print:bg-slate-200">NA</th>
                          <th className="border p-2 w-24 text-center">Predikat</th>
                          <th className="border p-2 w-24 text-center">Ket</th>
                      </tr>
                  </thead>
                  <tbody>
                      {students.map((s, idx) => {
                           // Logic Kalkulasi Nilai
                           const formativeScores = Object.values(s.formative || {}).map(v => parseInt(v)||0);
                           const summativeScores = Object.values(s.summative || {}).map(v => parseInt(v)||0);
                           const avgF = formativeScores.length ? (formativeScores.reduce((a,b)=>a+b,0)/formativeScores.length).toFixed(0) : 0;
                           const avgS = summativeScores.length ? (summativeScores.reduce((a,b)=>a+b,0)/summativeScores.length).toFixed(0) : 0;
                           const na = calculateFinalGrade(s);
                           
                           let pred = 'D';
                           if(na >= 90) pred = 'A';
                           else if(na >= 80) pred = 'B';
                           else if(na >= 70) pred = 'C';

                           return (
                               <tr key={s.id} className="print:border-black">
                                   <td className="border p-2 text-center">{idx+1}</td>
                                   <td className="border p-2">{s.nisn}</td>
                                   <td className="border p-2 font-medium">{s.name}</td>
                                   <td className="border p-2 text-center">{avgF}</td>
                                   <td className="border p-2 text-center">{avgS}</td>
                                   <td className="border p-2 text-center font-bold bg-slate-50">{na}</td>
                                   <td className="border p-2 text-center font-bold">{pred}</td>
                                   <td className="border p-2 text-center text-xs">
                                       {na >= 75 ? <span className="text-green-600">Tuntas</span> : <span className="text-red-600">Belum</span>}
                                   </td>
                               </tr>
                           )
                      })}
                  </tbody>
              </table>
          </div>

          <div className="grid grid-cols-3 mt-12 page-break-inside-avoid text-sm">
              <div className="text-center">
                  <p>Mengetahui,</p>
                  <p className="mb-16">Kepala Sekolah</p>
                  <p className="underline font-bold">{identity.principalName || '___________________'}</p>
              </div>
              <div></div>
              <div className="text-center">
                  <p>Guru Mata Pelajaran</p>
                  <p className="mb-16 font-bold underline">{identity.teacherName}</p>
                  <p>NIP. {identity.nip}</p>
              </div>
          </div>
      </div>
  )
};

// --- MAIN APP COMPONENT ---

const App = () => {
  // State Navigasi
  const [activeTab, setActiveTab] = useState('identity');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State Data Utama
  const [identity, setIdentity] = useState(initialIdentity);
  const [classList, setClassList] = useState([]); 
  const [selectedClass, setSelectedClass] = useState(''); 

  const [studentsData, setStudentsData] = useState({});
  const [curriculumData, setCurriculumData] = useState([]); 
  const [journalData, setJournalData] = useState([]); 

  // --- HELPERS ---
  const getCurrentStudents = () => {
    if (!selectedClass) return [];
    return studentsData[selectedClass] || [];
  };

  const updateCurrentStudents = (newStudentsList) => {
    if (!selectedClass) return;
    setStudentsData({
      ...studentsData,
      [selectedClass]: newStudentsList
    });
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} print:hidden`}>
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="font-bold text-lg tracking-wider">GURU<span className="text-blue-400">APP</span></h1>}
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-800 rounded"><Menu/></button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <NavItem icon={<User/>} label="Identitas" active={activeTab==='identity'} onClick={()=>setActiveTab('identity')} open={sidebarOpen}/>
          <NavItem icon={<Users/>} label="Daftar Hadir" active={activeTab==='attendance'} onClick={()=>setActiveTab('attendance')} open={sidebarOpen}/>
          <NavItem icon={<BookOpen/>} label="Lingkup Materi" active={activeTab==='curriculum'} onClick={()=>setActiveTab('curriculum')} open={sidebarOpen}/>
          <NavItem icon={<Calendar/>} label="Jurnal Harian" active={activeTab==='journal'} onClick={()=>setActiveTab('journal')} open={sidebarOpen}/>
          <div className="my-2 border-t border-slate-700 mx-4"></div>
          {/* Perbaikan: Menggunakan prop type Bahasa Inggris agar sesuai struktur data */}
          <NavItem icon={<ClipboardList/>} label="Asesmen Formatif" active={activeTab==='formative'} onClick={()=>setActiveTab('formative')} open={sidebarOpen}/>
          <NavItem icon={<PenTool/>} label="Asesmen Sumatif" active={activeTab==='summative'} onClick={()=>setActiveTab('summative')} open={sidebarOpen}/>
          <NavItem icon={<Heart/>} label="Sikap & Keaktifan" active={activeTab==='attitude'} onClick={()=>setActiveTab('attitude')} open={sidebarOpen}/>
          <div className="my-2 border-t border-slate-700 mx-4"></div>
          <NavItem icon={<BarChart2/>} label="Nilai Rapor" active={activeTab==='report'} onClick={()=>setActiveTab('report')} open={sidebarOpen}/>
        </nav>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b p-4 flex justify-between items-center z-10 print:hidden">
            <div>
              <h2 className="text-xl font-bold text-slate-800 uppercase">{identity.subject || 'Mata Pelajaran'}</h2>
              <p className="text-xs text-slate-500">{identity.teacherName}</p>
            </div>
            
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">Kelas Aktif:</span>
                <div className="relative">
                    <select 
                        className="appearance-none bg-blue-50 border border-blue-200 text-blue-800 font-bold py-2 pl-4 pr-10 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        {classList.length === 0 && <option value="">(Belum ada kelas)</option>}
                        {classList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 text-blue-800 pointer-events-none" size={16}/>
                </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8 print:p-0 print:overflow-visible">
            {activeTab === 'identity' && (
              <IdentitySection 
                identity={identity} 
                setIdentity={setIdentity}
                classList={classList}
                setClassList={setClassList}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
              />
            )}
            {activeTab === 'attendance' && (
              <AttendanceSection 
                selectedClass={selectedClass}
                students={getCurrentStudents()}
                onUpdateStudents={updateCurrentStudents}
              />
            )}
            {activeTab === 'curriculum' && (
              <CurriculumSection 
                identity={identity}
                curriculumData={curriculumData}
                setCurriculumData={setCurriculumData}
              />
            )}
            {activeTab === 'journal' && (
              <JournalSection 
                selectedClass={selectedClass}
                curriculumData={curriculumData}
                journalData={journalData}
                setJournalData={setJournalData}
              />
            )}
            
            {/* Perbaikan: Pass tipe data dalam bahasa Inggris agar data tersimpan konsisten */}
            {activeTab === 'formative' && (
              <AssessmentSection 
                type="formative"
                selectedClass={selectedClass}
                students={getCurrentStudents()}
                onUpdateStudents={updateCurrentStudents}
              />
            )}
            {activeTab === 'summative' && (
              <AssessmentSection 
                type="summative"
                selectedClass={selectedClass}
                students={getCurrentStudents()}
                onUpdateStudents={updateCurrentStudents}
              />
            )}
            {activeTab === 'attitude' && (
              <AssessmentSection 
                type="attitude"
                selectedClass={selectedClass}
                students={getCurrentStudents()}
                onUpdateStudents={updateCurrentStudents}
              />
            )}
            {activeTab === 'report' && (
              <ReportSection 
                identity={identity}
                selectedClass={selectedClass}
                students={getCurrentStudents()}
              />
            )}
        </div>
      </main>

    </div>
  );
};

// Simple Nav Item Component
const NavItem = ({ icon, label, active, onClick, open }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    <div>{icon}</div>
    {open && <span className="font-medium text-sm">{label}</span>}
  </button>
);

export default App;
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // HAPUS TANDA // DI DEPAN INI JIKA DI KOMPUTER
import { 
  User, Users, BookOpen, Calendar, 
  ClipboardList, PenTool, Heart, 
  BarChart2, Menu, Plus, Trash2, 
  Printer, ChevronDown, Download, Upload, FileSpreadsheet,
  CalendarDays, FileText, Save, Database
} from 'lucide-react';

// --- UTILS & DATA STRUCTURE ---

const initialIdentity = {
  schoolName: '',
  principalName: '', 
  subject: '',
  teacherName: '',
  nip: '',
  semester: 'Ganjil',
  academicYear: '2025/2026',
};

const calculateFinalGrade = (student) => {
  const formativeScores = Object.values(student.formative || {}).map(v => parseInt(v)||0);
  const summativeScores = Object.values(student.summative || {}).map(v => parseInt(v)||0);
  const avgFormative = formativeScores.length ? formativeScores.reduce((a,b)=>a+b,0)/formativeScores.length : 0;
  const avgSummative = summativeScores.length ? summativeScores.reduce((a,b)=>a+b,0)/summativeScores.length : 0;
  return Math.round((avgFormative * 0.4) + (avgSummative * 0.6));
};

// Format Tanggal Indonesia
const formatDateIndo = (dateString) => {
  if(!dateString) return '-';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
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
    if(window.confirm(`Yakin ingin menghapus kelas ${cls}? Data siswa di dalamnya juga akan terhapus permanen.`)) {
        const newList = classList.filter(c => c !== cls);
        setClassList(newList);
        if (selectedClass === cls) setSelectedClass(newList[0] || '');
    }
  };

  // Fungsi Reset Data Total
  const handleResetAll = () => {
    if(window.confirm("PERINGATAN KERAS!\n\nApakah Anda yakin ingin MENGHAPUS SEMUA DATA APLIKASI?\n(Identitas, Siswa, Nilai, Jurnal akan hilang selamanya).\n\nTindakan ini tidak bisa dibatalkan.")) {
        localStorage.clear();
        window.location.reload();
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-2xl font-bold text-slate-800">1. Identitas & Pengaturan Kelas</h2>
        <button onClick={handleResetAll} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 border border-red-200 px-2 py-1 rounded">
            <Trash2 size={12}/> Reset Semua Data Aplikasi
        </button>
      </div>
      
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
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded flex items-center gap-2">
            <Database size={16}/> <strong>Status:</strong> Data tersimpan otomatis di browser ini.
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceSection = ({ selectedClass, students, onUpdateStudents, selectedDate }) => {
  const [newStudent, setNewStudent] = useState({ name: '', nim: '', nisn: '', gender: 'L' });

  if (!selectedClass) return <div className="p-10 text-center text-slate-500">Silakan pilih/tambah kelas terlebih dahulu di menu Identitas.</div>;

  const addStudent = () => {
    if (!newStudent.name) return;
    const updated = [...students, { 
      ...newStudent, 
      id: Date.now(),
      attendanceHistory: {},
      recap: { s: 0, i: 0, a: 0 } 
    }];
    onUpdateStudents(updated);
    setNewStudent({ name: '', nim: '', nisn: '', gender: 'L' });
  };

  const updateDailyAttendance = (id, status) => {
    const updated = students.map(s => {
        if(s.id === id) {
            const newHistory = { ...s.attendanceHistory, [selectedDate]: status };
            return { ...s, attendanceHistory: newHistory };
        }
        return s;
    });
    onUpdateStudents(updated);
  };

  const updateRecap = (id, field, val) => {
    const updated = students.map(s => s.id === id ? { ...s, recap: { ...s.recap, [field]: val } } : s);
    onUpdateStudents(updated);
  };

  // --- EXCEL FUNCTIONS ---
  const handleDownloadTemplate = () => {
    if (typeof XLSX === 'undefined') { alert("Fitur Excel butuh 'npm install xlsx' di komputer lokal."); return; }
    const templateData = [{ No: 1, NISN: "123", NIM: "101", Nama: "Siswa A", Gender: "L" }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Siswa");
    XLSX.writeFile(wb, "Template_Siswa.xlsx");
  };

  const handleImportExcel = (e) => {
    if (typeof XLSX === 'undefined') { alert("Fitur Excel butuh 'npm install xlsx' di komputer lokal."); return; }
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      const imported = data.map((row, i) => ({
        id: Date.now() + i,
        name: row['Nama'] || row['nama'] || row['NAMA'] || 'No Name',
        nisn: row['NISN'] || row['nisn'] || '-',
        nim: row['NIM'] || row['nim'] || '-',
        gender: (row['Gender'] || row['gender'] || 'L').toUpperCase(),
        attendanceHistory: {},
        recap: { s: 0, i: 0, a: 0 },
        formative: {}, summative: {}, attitude: {}
      }));
      if(confirm(`Import ${imported.length} siswa?`)) onUpdateStudents([...students, ...imported]);
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  // Export Data Presensi
  const handleExportAttendance = () => {
    if (typeof XLSX === 'undefined') { alert("Fitur Excel belum aktif."); return; }
    
    // Format data untuk Excel
    const dataToExport = students.map((s, idx) => ({
        No: idx + 1,
        NISN: s.nisn,
        Nama: s.name,
        Gender: s.gender,
        [`Hadir (${selectedDate})`]: s.attendanceHistory?.[selectedDate] === 'H' ? 'Hadir' : 'Tidak',
        'Total Sakit': s.recap?.s || 0,
        'Total Izin': s.recap?.i || 0,
        'Total Alpha': s.recap?.a || 0
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Presensi");
    XLSX.writeFile(wb, `Presensi_Kelas_${selectedClass}_${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b pb-2">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">2. Daftar Hadir (Presensi)</h2>
            <p className="text-sm text-blue-600 font-medium mt-1 flex items-center gap-2">
                <Calendar size={14}/> Menampilkan Data Tanggal: <span className="underline font-bold">{formatDateIndo(selectedDate)}</span>
            </p>
         </div>
         <div className="bg-blue-100 px-4 py-1 rounded-lg font-bold text-blue-800">{selectedClass}</div>
      </div>

      {/* TOOLS IMPORT / EXPORT */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap justify-between items-center mb-4 shadow-sm">
        <div className="text-sm text-slate-600 font-medium flex items-center gap-2">
            <Users size={18}/> Manajemen Data Siswa
        </div>
        <div className="flex gap-2">
            <button onClick={handleDownloadTemplate} className="bg-slate-100 border border-slate-300 text-slate-600 px-3 py-1 rounded text-xs hover:bg-slate-200">
                1. Download Template
            </button>
            <label className="bg-green-600 text-white px-3 py-1 rounded text-xs cursor-pointer hover:bg-green-700 flex items-center gap-1">
                <Upload size={14}/> 2. Import Siswa
                <input type="file" className="hidden" onChange={handleImportExcel}/>
            </label>
            <div className="w-px bg-slate-300 mx-1"></div>
            <button onClick={handleExportAttendance} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center gap-1">
                <Download size={14}/> Export Presensi Hari Ini
            </button>
        </div>
      </div>

      {/* INPUT MANUAL */}
      <div className="bg-slate-50 p-3 rounded border flex gap-2 items-end mb-4">
        <input placeholder="Nama Siswa" value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name:e.target.value})} className="flex-1 p-2 border rounded text-sm"/>
        <button onClick={addStudent} className="bg-blue-600 text-white p-2 rounded"><Plus/></button>
      </div>

      {/* TABEL PRESENSI */}
      <div className="overflow-x-auto bg-white border rounded shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-white uppercase text-xs">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Nama Siswa</th>
              <th className="p-3 text-center bg-blue-900 border-x border-blue-700">
                  HADIR<br/>
                  <span className="text-[9px] normal-case opacity-75">{selectedDate}</span>
              </th>
              <th className="p-3 text-center w-12 bg-yellow-600">Sakit</th>
              <th className="p-3 text-center w-12 bg-yellow-600">Izin</th>
              <th className="p-3 text-center w-12 bg-red-600">Alpha</th>
              <th className="p-3 text-center w-10">Act</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((s, idx) => {
                const isPresent = s.attendanceHistory?.[selectedDate] === 'H';
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 text-center">{idx+1}</td>
                    <td className="p-3 font-medium">
                        {s.name} <br/> 
                        <span className="text-xs text-slate-400">{s.nisn}</span>
                    </td>
                    <td className="p-3 text-center bg-blue-50 border-x">
                      <input 
                        type="checkbox" 
                        checked={isPresent} 
                        onChange={(e)=>updateDailyAttendance(s.id, e.target.checked ? 'H' : null)} 
                        className="w-6 h-6 accent-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-1"><input type="number" value={s.recap?.s||0} onChange={e=>updateRecap(s.id,'s',e.target.value)} className="w-full text-center border-none bg-transparent"/></td>
                    <td className="p-1"><input type="number" value={s.recap?.i||0} onChange={e=>updateRecap(s.id,'i',e.target.value)} className="w-full text-center border-none bg-transparent"/></td>
                    <td className="p-1"><input type="number" value={s.recap?.a||0} onChange={e=>updateRecap(s.id,'a',e.target.value)} className="w-full text-center border-none bg-transparent"/></td>
                    <td className="p-2 text-center text-red-500 cursor-pointer" onClick={()=>onUpdateStudents(students.filter(x=>x.id!==s.id))}><Trash2 size={16}/></td>
                  </tr>
                )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const JournalSection = ({ selectedClass, curriculumData, journalData, setJournalData, selectedDate }) => {
  const [entry, setEntry] = useState({ time: '', scope: '', tp: '', activity: '', reflection: '', followup: '' });
  
  const addJournal = () => {
      setJournalData([...journalData, { ...entry, date: selectedDate, id: Date.now(), class: selectedClass || 'Umum' }]);
      setEntry({ ...entry, activity: '', reflection: '', followup: '' }); 
  };

  const filteredJournal = journalData.filter(j => 
    (j.date === selectedDate) && (!selectedClass || j.class === selectedClass)
  );

  const handleExportJournal = () => {
    if (typeof XLSX === 'undefined') { alert("Fitur Excel belum aktif."); return; }
    if (filteredJournal.length === 0) { alert("Tidak ada data jurnal untuk diexport pada tanggal ini."); return; }

    const dataToExport = filteredJournal.map((j, idx) => ({
        No: idx + 1,
        Tanggal: j.date,
        Jam: j.time,
        Kelas: j.class,
        Materi: j.scope,
        'Tujuan Pembelajaran': j.tp,
        Kegiatan: j.activity,
        Refleksi: j.reflection,
        'Tindak Lanjut': j.followup
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jurnal");
    XLSX.writeFile(wb, `Jurnal_Mengajar_${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
       <div className="flex justify-between items-center border-b pb-2">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">4. Jurnal Harian</h2>
            <p className="text-sm text-blue-600 font-medium mt-1">Tanggal: {formatDateIndo(selectedDate)}</p>
         </div>
         <div className="bg-blue-100 px-4 py-1 rounded-lg font-bold text-blue-800">{selectedClass || 'Semua Kelas'}</div>
      </div>

      {/* FORM JURNAL */}
      <div className="bg-white p-4 rounded shadow border grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-xs font-bold text-slate-500">Tanggal</label><input type="text" className="w-full p-2 border rounded bg-slate-100 text-slate-500" value={formatDateIndo(selectedDate)} readOnly/></div>
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
              <button onClick={addJournal} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700">Simpan Jurnal Tanggal Ini</button>
          </div>
      </div>

      {/* TABEL JURNAL */}
      <div className="flex justify-between items-end mt-6">
        <h3 className="font-bold text-slate-700 flex items-center gap-2"><BookOpen size={18}/> Catatan Jurnal</h3>
        {filteredJournal.length > 0 && (
            <button onClick={handleExportJournal} className="bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-2 hover:bg-green-700">
                <Download size={14}/> Export Jurnal Excel
            </button>
        )}
      </div>
      
      {filteredJournal.length === 0 ? (
          <div className="p-4 bg-yellow-50 text-yellow-700 text-sm border border-yellow-200 rounded mt-2">Belum ada jurnal untuk tanggal dan kelas ini.</div>
      ) : (
        <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100">
                    <tr><th className="border p-2">Jam</th><th className="border p-2">Materi</th><th className="border p-2">Kegiatan</th><th className="border p-2">Refleksi</th><th className="border p-2">Act</th></tr>
                </thead>
                <tbody>
                    {filteredJournal.map(j => (
                        <tr key={j.id} className="bg-white">
                            <td className="border p-2 w-16">{j.time}</td><td className="border p-2">{j.scope}</td><td className="border p-2">{j.activity}</td><td className="border p-2">{j.reflection}</td><td className="border p-2 text-red-500 cursor-pointer w-8" onClick={()=>setJournalData(journalData.filter(x=>x.id!==j.id))}><Trash2 size={14}/></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

// Generic Components
const CurriculumSection = ({ identity, curriculumData, setCurriculumData }) => {
    const [newItem, setNewItem] = useState({ scope: '', tp: '', kktp: '' });
    const addItem = () => { if(newItem.scope) { setCurriculumData([...curriculumData, { ...newItem, id: Date.now() }]); setNewItem({ scope: '', tp: '', kktp: '' }); }};
    return (
      <div className="space-y-6 animate-fadeIn">
        <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">3. Lingkup Materi & TP</h2>
        <div className="bg-slate-100 p-4 rounded text-sm grid grid-cols-2 gap-4"><div><b>Sekolah:</b> {identity.schoolName}</div><div><b>Mapel:</b> {identity.subject}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input placeholder="Lingkup Materi" value={newItem.scope} onChange={e=>setNewItem({...newItem, scope: e.target.value})} className="p-2 border rounded"/>
            <input placeholder="Tujuan Pembelajaran (TP)" value={newItem.tp} onChange={e=>setNewItem({...newItem, tp: e.target.value})} className="p-2 border rounded"/>
            <div className="flex gap-2"><input placeholder="KKTP" value={newItem.kktp} onChange={e=>setNewItem({...newItem, kktp: e.target.value})} className="p-2 border rounded flex-1"/><button onClick={addItem} className="bg-blue-600 text-white px-4 rounded"><Plus/></button></div>
        </div>
        <table className="w-full text-sm border-collapse border border-slate-300"><thead className="bg-slate-200"><tr><th className="border p-2 w-10">No</th><th className="border p-2">Materi</th><th className="border p-2">TP</th><th className="border p-2">KKTP</th><th className="border p-2 w-10">Act</th></tr></thead><tbody>{curriculumData.map((item, idx) => (<tr key={item.id}><td className="border p-2 text-center">{idx+1}</td><td className="border p-2">{item.scope}</td><td className="border p-2">{item.tp}</td><td className="border p-2">{item.kktp}</td><td className="border p-2 text-center text-red-500 cursor-pointer" onClick={()=>setCurriculumData(curriculumData.filter(x=>x.id!==item.id))}><Trash2 size={16}/></td></tr>))}</tbody></table>
      </div>
    );
};

const AssessmentSection = ({ type, selectedClass, students, onUpdateStudents }) => {
    if (!selectedClass) return <div className="p-10 text-center text-slate-500">Pilih Kelas Terlebih Dahulu.</div>;
    const titleMap = { formative: 'Formatif', summative: 'Sumatif', attitude: 'Sikap & Keaktifan' };
    let columns = type === 'formative' ? ['TP1', 'TP2', 'TP3', 'TP4', 'TP5'] : type === 'summative' ? ['LM1', 'LM2', 'LM3', 'LM4', 'STS', 'SAS'] : ['Religius', 'Jujur', 'Disiplin', 'Kerjasama', 'Kreatif'];
    const updateScore = (id, col, val) => {
        const student = students.find(s => s.id === id);
        const updatedStudent = { ...student, [type]: { ...student[type], [col]: val } };
        onUpdateStudents(students.map(s => s.id === id ? updatedStudent : s));
    };
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2"><h2 className="text-2xl font-bold text-slate-800 capitalize">5-7. Penilaian {titleMap[type]}</h2><div className="bg-blue-100 px-4 py-1 rounded-lg font-bold text-blue-800">Kelas: {selectedClass}</div></div>
            <div className="overflow-x-auto bg-white border rounded shadow-sm"><table className="w-full text-sm text-center border-collapse"><thead className="bg-slate-700 text-white"><tr><th className="p-3 text-left w-10">No</th><th className="p-3 text-left sticky left-0 bg-slate-700 z-10 w-48">Nama Siswa</th>{columns.map(c => <th key={c} className="p-3 border-l border-slate-600 w-20">{c}</th>)}{type !== 'attitude' && <th className="p-3 bg-slate-900 w-20">Rata</th>}</tr></thead><tbody>{students.map((s, idx) => {const scores = s[type] || {}; const vals = columns.map(c => parseInt(scores[c]) || 0); const avg = vals.filter(v=>v>0).length ? (vals.reduce((a,b)=>a+b,0)/vals.filter(v=>v>0).length).toFixed(0) : 0; return (<tr key={s.id} className="hover:bg-slate-50 border-b"><td className="p-3 text-left">{idx+1}</td><td className="p-3 text-left font-medium sticky left-0 bg-white z-10 border-r">{s.name}</td>{columns.map(c => (<td key={c} className="p-1 border-r"><input type={type==='attitude'?'text':'number'} className="w-full text-center p-1 outline-none" value={scores[c] || ''} placeholder="-" onChange={e=>updateScore(s.id, c, e.target.value)}/></td>))}{type !== 'attitude' && <td className="p-3 font-bold bg-slate-100">{avg}</td>}</tr>)})}</tbody></table></div>
        </div>
    )
};

const ReportSection = ({ identity, selectedClass, students, selectedDate }) => {
    if (!selectedClass) return <div className="p-10 text-center text-slate-500">Pilih Kelas Terlebih Dahulu.</div>;

    const handleExportReport = () => {
        if (typeof XLSX === 'undefined') { alert("Fitur Excel belum aktif."); return; }
        
        const dataToExport = students.map((s, idx) => {
            const formativeScores = Object.values(s.formative || {}).map(v => parseInt(v)||0);
            const summativeScores = Object.values(s.summative || {}).map(v => parseInt(v)||0);
            const avgF = formativeScores.length ? (formativeScores.reduce((a,b)=>a+b,0)/formativeScores.length).toFixed(0) : 0;
            const avgS = summativeScores.length ? (summativeScores.reduce((a,b)=>a+b,0)/summativeScores.length).toFixed(0) : 0;
            const na = calculateFinalGrade(s);
            let pred = 'D'; if(na >= 90) pred = 'A'; else if(na >= 80) pred = 'B'; else if(na >= 70) pred = 'C';

            return {
                No: idx + 1,
                NISN: s.nisn,
                Nama: s.name,
                'Rata Formatif': avgF,
                'Rata Sumatif': avgS,
                'Nilai Akhir': na,
                Predikat: pred,
                Keterangan: na >= 75 ? 'Tuntas' : 'Belum Tuntas'
            };
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Nilai Rapor");
        XLSX.writeFile(wb, `Leger_Nilai_Kelas_${selectedClass}.xlsx`);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2 print:hidden">
                <h2 className="text-2xl font-bold text-slate-800">8. Kelola Nilai Rapor</h2>
                <div className="flex gap-2">
                    <button onClick={handleExportReport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        <FileSpreadsheet size={16}/> Export Excel
                    </button>
                    <button onClick={()=>window.print()} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-900">
                        <Printer size={16}/> Cetak
                    </button>
                </div>
            </div>
            <div className="hidden print:block text-center mb-6"><h1 className="text-xl font-bold">REKAPITULASI NILAI RAPOR</h1><p>Tahun Pelajaran {identity.academicYear} - Semester {identity.semester}</p><p>Kelas: {selectedClass}</p></div>
            <div className="overflow-x-auto bg-white border rounded shadow-sm"><table className="w-full text-sm border-collapse border border-slate-300"><thead className="bg-slate-800 text-white print:bg-white print:text-black"><tr><th className="border p-2">No</th><th className="border p-2 text-left">NISN</th><th className="border p-2 text-left">Nama Siswa</th><th className="border p-2 w-16 text-center">Rata Formatif</th><th className="border p-2 w-16 text-center">Rata Sumatif</th><th className="border p-2 w-16 text-center bg-blue-900 text-white print:text-black print:bg-slate-200">NA</th><th className="border p-2 w-24 text-center">Predikat</th><th className="border p-2 w-24 text-center">Ket</th></tr></thead><tbody>{students.map((s, idx) => { const formativeScores = Object.values(s.formative || {}).map(v => parseInt(v)||0); const summativeScores = Object.values(s.summative || {}).map(v => parseInt(v)||0); const avgF = formativeScores.length ? (formativeScores.reduce((a,b)=>a+b,0)/formativeScores.length).toFixed(0) : 0; const avgS = summativeScores.length ? (summativeScores.reduce((a,b)=>a+b,0)/summativeScores.length).toFixed(0) : 0; const na = calculateFinalGrade(s); let pred = 'D'; if(na >= 90) pred = 'A'; else if(na >= 80) pred = 'B'; else if(na >= 70) pred = 'C'; return (<tr key={s.id} className="print:border-black"><td className="border p-2 text-center">{idx+1}</td><td className="border p-2">{s.nisn}</td><td className="border p-2 font-medium">{s.name}</td><td className="border p-2 text-center">{avgF}</td><td className="border p-2 text-center">{avgS}</td><td className="border p-2 text-center font-bold bg-slate-50">{na}</td><td className="border p-2 text-center font-bold">{pred}</td><td className="border p-2 text-center text-xs">{na >= 75 ? <span className="text-green-600">Tuntas</span> : <span className="text-red-600">Belum</span>}</td></tr>)})}</tbody></table></div>
            <div className="grid grid-cols-3 mt-12 page-break-inside-avoid text-sm"><div className="text-center"><p>Mengetahui,</p><p className="mb-16">Kepala Sekolah</p><p className="underline font-bold">{identity.principalName || '___________________'}</p></div><div></div><div className="text-center"><p>Tanggal Cetak: {formatDateIndo(selectedDate)}</p><p>Guru Mata Pelajaran</p><p className="mb-16 font-bold underline">{identity.teacherName}</p><p>NIP. {identity.nip}</p></div></div>
        </div>
    )
};

// --- MAIN APP ---

const App = () => {
  const [activeTab, setActiveTab] = useState('identity');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // --- STATE WITH LOCAL STORAGE PERSISTENCE ---
  
  // 1. Identitas Guru
  const [identity, setIdentity] = useState(() => {
    const saved = localStorage.getItem('guru_identity');
    return saved ? JSON.parse(saved) : initialIdentity;
  });

  // 2. Daftar Kelas
  const [classList, setClassList] = useState(() => {
    const saved = localStorage.getItem('guru_classList');
    return saved ? JSON.parse(saved) : [];
  });

  // 3. Kelas Terpilih
  const [selectedClass, setSelectedClass] = useState(() => {
     return localStorage.getItem('guru_selectedClass') || '';
  });

  // 4. Data Siswa & Nilai
  const [studentsData, setStudentsData] = useState(() => {
    const saved = localStorage.getItem('guru_studentsData');
    return saved ? JSON.parse(saved) : {};
  });

  // 5. Kurikulum (TP/KKTP)
  const [curriculumData, setCurriculumData] = useState(() => {
    const saved = localStorage.getItem('guru_curriculumData');
    return saved ? JSON.parse(saved) : [];
  });

  // 6. Jurnal Harian
  const [journalData, setJournalData] = useState(() => {
    const saved = localStorage.getItem('guru_journalData');
    return saved ? JSON.parse(saved) : [];
  });

  // --- AUTO SAVE EFFECT ---
  // Setiap kali data berubah, simpan ke localStorage
  useEffect(() => { localStorage.setItem('guru_identity', JSON.stringify(identity)); }, [identity]);
  useEffect(() => { localStorage.setItem('guru_classList', JSON.stringify(classList)); }, [classList]);
  useEffect(() => { localStorage.setItem('guru_selectedClass', selectedClass); }, [selectedClass]);
  useEffect(() => { localStorage.setItem('guru_studentsData', JSON.stringify(studentsData)); }, [studentsData]);
  useEffect(() => { localStorage.setItem('guru_curriculumData', JSON.stringify(curriculumData)); }, [curriculumData]);
  useEffect(() => { localStorage.setItem('guru_journalData', JSON.stringify(journalData)); }, [journalData]);

  // Helper Wrappers
  const getCurrentStudents = () => selectedClass ? (studentsData[selectedClass] || []) : [];
  const updateCurrentStudents = (newList) => selectedClass && setStudentsData({ ...studentsData, [selectedClass]: newList });

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
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
          <NavItem icon={<ClipboardList/>} label="Asesmen Formatif" active={activeTab==='formative'} onClick={()=>setActiveTab('formative')} open={sidebarOpen}/>
          <NavItem icon={<PenTool/>} label="Asesmen Sumatif" active={activeTab==='summative'} onClick={()=>setActiveTab('summative')} open={sidebarOpen}/>
          <NavItem icon={<Heart/>} label="Sikap & Keaktifan" active={activeTab==='attitude'} onClick={()=>setActiveTab('attitude')} open={sidebarOpen}/>
          <div className="my-2 border-t border-slate-700 mx-4"></div>
          <NavItem icon={<BarChart2/>} label="Nilai Rapor" active={activeTab==='report'} onClick={()=>setActiveTab('report')} open={sidebarOpen}/>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b p-4 flex flex-col md:flex-row justify-between items-center z-10 print:hidden gap-4">
            <div><h2 className="text-xl font-bold text-slate-800 uppercase">{identity.subject || 'Mata Pelajaran'}</h2><p className="text-xs text-slate-500">{identity.teacherName}</p></div>
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded border border-yellow-200">
                    <CalendarDays size={18} className="text-yellow-700"/>
                    <div className="flex flex-col"><span className="text-[10px] text-yellow-800 font-bold uppercase">Tanggal Aktif</span><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"/></div>
                </div>
                <div className="relative"><select className="appearance-none bg-blue-600 text-white font-bold py-2 pl-4 pr-10 rounded-lg cursor-pointer focus:outline-none hover:bg-blue-700" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{classList.length === 0 && <option value="">(Buat Kelas Dulu)</option>}{classList.map(c => <option key={c} value={c}>{c}</option>)}</select><ChevronDown className="absolute right-3 top-3 text-white pointer-events-none" size={16}/></div>
            </div>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8 print:p-0 print:overflow-visible">
            {activeTab === 'identity' && <IdentitySection identity={identity} setIdentity={setIdentity} classList={classList} setClassList={setClassList} selectedClass={selectedClass} setSelectedClass={setSelectedClass}/>}
            {activeTab === 'attendance' && <AttendanceSection selectedClass={selectedClass} students={getCurrentStudents()} onUpdateStudents={updateCurrentStudents} selectedDate={selectedDate}/>}
            {activeTab === 'curriculum' && <CurriculumSection identity={identity} curriculumData={curriculumData} setCurriculumData={setCurriculumData}/>}
            {activeTab === 'journal' && <JournalSection selectedClass={selectedClass} curriculumData={curriculumData} journalData={journalData} setJournalData={setJournalData} selectedDate={selectedDate}/>}
            {activeTab === 'formative' && <AssessmentSection type="formative" selectedClass={selectedClass} students={getCurrentStudents()} onUpdateStudents={updateCurrentStudents}/>}
            {activeTab === 'summative' && <AssessmentSection type="summative" selectedClass={selectedClass} students={getCurrentStudents()} onUpdateStudents={updateCurrentStudents}/>}
            {activeTab === 'attitude' && <AssessmentSection type="attitude" selectedClass={selectedClass} students={getCurrentStudents()} onUpdateStudents={updateCurrentStudents}/>}
            {activeTab === 'report' && <ReportSection identity={identity} selectedClass={selectedClass} students={getCurrentStudents()} selectedDate={selectedDate}/>}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, open }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><div>{icon}</div>{open && <span className="font-medium text-sm">{label}</span>}</button>
);

export default App;
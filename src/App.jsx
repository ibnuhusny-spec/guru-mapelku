import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // JANGAN LUPA HAPUS TANDA // INI DI VS CODE (Agar fitur Excel jalan)
import { 
  User, Users, BookOpen, Calendar, 
  ClipboardList, PenTool, Heart, 
  BarChart2, Menu, Plus, Trash2, 
  Printer, ChevronDown, Download, Upload, FileSpreadsheet,
  CalendarDays, FileText, Database, CheckSquare, School, ArrowRight, LogOut
} from 'lucide-react';

// --- INITIAL STATE ---

const initialIdentity = {
  schoolName: 'SMA NEGERI CONTOH', // Default
  schoolAddress: 'Jl. Pendidikan No. 1, Kota Belajar', // Tambahan Alamat untuk KOP
  principalName: '', 
  principalNip: '',
  subject: '',
  teacherName: '',
  nip: '',
  semester: 'Ganjil',
  academicYear: '2025/2026',
};

// --- HELPER FUNCTIONS ---

const getAttendanceStats = (student) => {
    const historyValues = Object.values(student.attendanceHistory || {});
    const h = historyValues.filter(val => val === 'H').length;
    const s = parseInt(student.recap?.s || 0);
    const i = parseInt(student.recap?.i || 0);
    const a = parseInt(student.recap?.a || 0);
    return { h, s, i, a, total: h + s + i + a };
};

const calculateFinalGrade = (student) => {
  const formativeScores = Object.values(student.formative || {}).map(v => parseInt(v)||0);
  const avgFormative = formativeScores.length ? formativeScores.reduce((a,b)=>a+b,0)/formativeScores.length : 0;

  const summativeScores = Object.values(student.summative || {}).map(v => parseInt(v)||0);
  const avgSummative = summativeScores.length ? summativeScores.reduce((a,b)=>a+b,0)/summativeScores.length : 0;

  const attitudeScores = Object.values(student.attitude || {}).map(v => parseInt(v)||0);
  const avgAttitude = attitudeScores.length ? attitudeScores.reduce((a,b)=>a+b,0)/attitudeScores.length : 0;

  const { h, total } = getAttendanceStats(student);
  const attendanceScore = total > 0 ? (h / total) * 100 : 100;

  const finalScore = (avgFormative * 0.35) + (avgSummative * 0.35) + (avgAttitude * 0.20) + (attendanceScore * 0.10);

  return {
    avgFormative: avgFormative.toFixed(1),
    avgSummative: avgSummative.toFixed(1),
    avgAttitude: avgAttitude.toFixed(1),
    attendanceScore: attendanceScore.toFixed(0),
    finalScore: Math.round(finalScore)
  };
};

const formatDateIndo = (dateString) => {
  if(!dateString) return '-';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// --- COMPONENT: KOP SURAT (Untuk Tampilan Cetak/Web) ---
const KopSurat = ({ identity }) => (
  <div className="hidden print:flex flex-row items-center border-b-4 border-double border-black pb-4 mb-6">
    {/* Logo Sekolah (Pastikan file logo.png ada di folder public/ root) */}
    <div className="w-24 h-24 flex items-center justify-center mr-4">
       <img src="/logo.png" alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
    </div>
    <div className="flex-1 text-center">
        <h3 className="text-xl font-bold uppercase tracking-wide m-0">PEMERINTAH PROVINSI</h3>
        <h2 className="text-3xl font-extrabold uppercase m-0 tracking-wider">{identity.schoolName || 'NAMA SEKOLAH'}</h2>
        <p className="text-sm italic mt-1">{identity.schoolAddress || 'Alamat Sekolah Belum Diisi'}</p>
    </div>
  </div>
);

// --- COMPONENT: LANDING PAGE ---
const LandingPage = ({ onStart, identity, setIdentity }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-12 rounded-2xl shadow-2xl flex flex-col items-center max-w-lg w-full z-10 animate-fadeIn">
        
        {/* Logo Container */}
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-blue-200">
            {/* Menggunakan logo.png, fallback ke Icon jika tidak ada */}
            <img 
                src="/logo.png" 
                alt="Logo Sekolah" 
                className="w-24 h-24 object-contain"
                onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
            />
            <School size={48} className="text-blue-900 hidden" /> 
        </div>

        <h3 className="text-blue-200 font-medium tracking-widest text-sm uppercase mb-2">Sistem Administrasi Guru</h3>
        
        {/* Editable School Name on Landing */}
        <input 
            type="text" 
            value={identity.schoolName}
            onChange={(e) => setIdentity({...identity, schoolName: e.target.value.toUpperCase()})}
            className="bg-transparent border-b border-white/30 text-center text-3xl md:text-4xl font-bold text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 w-full mb-8 pb-2"
            placeholder="NAMA SEKOLAH"
        />

        <button 
            onClick={onStart}
            className="group bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 flex items-center gap-3 text-lg"
        >
            Masuk Aplikasi <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
        </button>

        <div className="mt-12 text-center opacity-60 text-xs">
            <p>Dikembangkan oleh:</p>
            <p className="font-semibold text-sm tracking-wide mt-1">IBNU HUSNY</p>
            <p>Versi 2.5 (Daily & Export)</p>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS (MAIN APP) ---

const IdentitySection = ({ identity, setIdentity, classList, setClassList, selectedClass, setSelectedClass }) => {
  const [newClassInput, setNewClassInput] = useState('');

  const addClass = () => { if (newClassInput && !classList.includes(newClassInput)) { setClassList([...classList, newClassInput]); if (!selectedClass) setSelectedClass(newClassInput); setNewClassInput(''); }};
  const removeClass = (cls) => { if(window.confirm(`Hapus kelas ${cls}?`)) { const newList = classList.filter(c => c !== cls); setClassList(newList); if (selectedClass === cls) setSelectedClass(newList[0] || ''); }};
  const handleResetAll = () => { if(window.confirm("RESET SEMUA DATA?")) { localStorage.clear(); window.location.reload(); }};

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-2xl font-bold text-slate-800">1. Identitas & Pengaturan</h2>
        <button onClick={handleResetAll} className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded hover:bg-red-50">Reset Data</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <h3 className="font-bold text-blue-600 flex items-center gap-2"><User size={18}/> Data Administrasi</h3>
          <div><label className="text-sm text-slate-500">Nama Sekolah</label><input type="text" className="w-full p-2 border rounded" value={identity.schoolName} onChange={e=>setIdentity({...identity, schoolName: e.target.value})} /></div>
          <div><label className="text-sm text-slate-500">Alamat Sekolah (Untuk KOP)</label><input type="text" className="w-full p-2 border rounded" placeholder="Jl. Contoh No. 1..." value={identity.schoolAddress} onChange={e=>setIdentity({...identity, schoolAddress: e.target.value})} /></div>
          
          <div className="flex gap-2">
            <div className="flex-1"><label className="text-sm text-slate-500">Kepala Sekolah</label><input type="text" className="w-full p-2 border rounded" value={identity.principalName} onChange={e=>setIdentity({...identity, principalName: e.target.value})} /></div>
            <div className="w-1/3"><label className="text-sm text-slate-500">NIP KS</label><input type="text" className="w-full p-2 border rounded" value={identity.principalNip} onChange={e=>setIdentity({...identity, principalNip: e.target.value})} /></div>
          </div>

          <div><label className="text-sm text-slate-500">Mata Pelajaran</label><input type="text" className="w-full p-2 border rounded" value={identity.subject} onChange={e=>setIdentity({...identity, subject: e.target.value})} /></div>
          <div className="flex gap-2">
             <div className="flex-1"><label className="text-sm text-slate-500">Guru Mapel</label><input type="text" className="w-full p-2 border rounded" value={identity.teacherName} onChange={e=>setIdentity({...identity, teacherName: e.target.value})} /></div>
             <div className="w-1/3"><label className="text-sm text-slate-500">NIP Guru</label><input type="text" className="w-full p-2 border rounded" value={identity.nip} onChange={e=>setIdentity({...identity, nip: e.target.value})} /></div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-sm text-slate-500">Semester</label><select className="w-full p-2 border rounded" value={identity.semester} onChange={e=>setIdentity({...identity, semester: e.target.value})}><option>Ganjil</option><option>Genap</option></select></div>
            <div><label className="text-sm text-slate-500">Thn. Ajar</label><input type="text" className="w-full p-2 border rounded" value={identity.academicYear} onChange={e=>setIdentity({...identity, academicYear: e.target.value})} /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <h3 className="font-bold text-green-600 flex items-center gap-2"><Users size={18}/> Manajemen Kelas</h3>
          <div className="flex gap-2"><input type="text" className="flex-1 p-2 border rounded" placeholder="Nama Kelas" value={newClassInput} onChange={e=>setNewClassInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && addClass()} /><button onClick={addClass} className="bg-green-600 text-white px-4 rounded"><Plus/></button></div>
          <div className="flex flex-wrap gap-2 mt-4">{classList.map(cls => (<div key={cls} className="bg-slate-100 px-3 py-1 rounded-full border border-slate-300 flex items-center gap-2">{cls}<button onClick={() => removeClass(cls)} className="text-red-500"><Trash2 size={12}/></button></div>))}</div>
        </div>
      </div>
    </div>
  );
};

const AttendanceSection = ({ selectedClass, students, onUpdateStudents, selectedDate, identity }) => {
  const [newStudent, setNewStudent] = useState({ name: '', nim: '', nisn: '', gender: 'L' });
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));

  if (!selectedClass) return <div className="p-10 text-center text-slate-500">Pilih Kelas Terlebih Dahulu.</div>;

  const addStudent = () => { if(newStudent.name){ onUpdateStudents([...students, { ...newStudent, id: Date.now(), attendanceHistory: {}, recap: {s:0,i:0,a:0} }]); setNewStudent({name:'',nim:'',nisn:'',gender:'L'}); }};
  const updateDaily = (id, status) => onUpdateStudents(students.map(s => s.id === id ? { ...s, attendanceHistory: { ...s.attendanceHistory, [selectedDate]: status } } : s));
  const updateRecap = (id, f, v) => onUpdateStudents(students.map(s => s.id === id ? { ...s, recap: { ...s.recap, [f]: v } } : s));
  const markAll = () => { if(confirm('Hadirkan semua?')) onUpdateStudents(students.map(s => ({ ...s, attendanceHistory: { ...s.attendanceHistory, [selectedDate]: 'H' } }))); };

  // EXCEL IMPORTS/EXPORTS
  const handleDownloadTemplate = () => {
    if (typeof XLSX === 'undefined') { alert("Fitur Excel belum aktif."); return; }
    const ws = XLSX.utils.json_to_sheet([{ No: 1, NISN: "123", NIM: "101", Nama: "Siswa A", Gender: "L" }]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Siswa");
    XLSX.writeFile(wb, "Template_Siswa.xlsx");
  };

  const handleImportExcel = (e) => {
    if (typeof XLSX === 'undefined') { alert("Fitur Excel belum aktif."); return; }
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      if(confirm(`Import ${data.length} siswa?`)) onUpdateStudents([...students, ...data.map((row, i) => ({ id: Date.now()+i, name: row['Nama']||'NoName', nisn: row['NISN']||'-', nim: row['NIM']||'-', gender: row['Gender']||'L', attendanceHistory: {}, recap: {s:0,i:0,a:0}, formative: {}, summative: {}, attitude: {} }))]);
    };
    reader.readAsBinaryString(file); e.target.value = null;
  };

  const handleExportMonthly = () => {
    if (typeof XLSX === 'undefined') { alert("Fitur Excel belum aktif."); return; }
    const [year, month] = exportMonth.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1, 1).toLocaleString('id-ID', { month: 'long' }).toUpperCase();

    // Data KOP untuk Excel
    const kopRows = [
        [identity.schoolName.toUpperCase()],
        [identity.schoolAddress],
        [`REKAPITULASI KEHADIRAN SISWA - KELAS ${selectedClass}`],
        [`BULAN: ${monthName} ${year}`],
        [] // Spasi
    ];

    const headers = ["No", "NISN", "Nama", "L/P"];
    for(let i=1; i<=daysInMonth; i++) headers.push(i);
    headers.push("H", "S", "I", "A");

    const dataRows = students.map((s, idx) => {
        const row = [idx + 1, s.nisn, s.name, s.gender];
        let hCount = 0;
        for(let i=1; i<=daysInMonth; i++) {
            const d = `${year}-${month}-${String(i).padStart(2,'0')}`;
            const st = s.attendanceHistory?.[d] || '';
            row.push(st);
            if(st === 'H') hCount++;
        }
        row.push(hCount, s.recap?.s||0, s.recap?.i||0, s.recap?.a||0);
        return row;
    });

    const footerRows = [
        [],[],
        ["Mengetahui,", "", "", "", "", "Tanggal:", formatDateIndo(new Date().toISOString())],
        ["Kepala Sekolah", "", "", "", "", "Guru Mata Pelajaran"],
        [],[],[],
        [identity.principalName, "", "", "", "", identity.teacherName],
        [`NIP. ${identity.principalNip}`, "", "", "", "", `NIP. ${identity.nip}`]
    ];

    const ws = XLSX.utils.aoa_to_sheet([...kopRows, headers, ...dataRows, ...footerRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Bulanan");
    XLSX.writeFile(wb, `Rekap_Absen_${monthName}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b pb-2">
         <div><h2 className="text-2xl font-bold text-slate-800">2. Daftar Hadir</h2><p className="text-sm text-blue-600"><Calendar size={14} className="inline"/> {formatDateIndo(selectedDate)}</p></div>
         <div className="flex gap-2"><button onClick={markAll} className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold hover:bg-blue-200 text-sm">Hadir Semua</button></div>
      </div>
      <div className="bg-white p-3 rounded border flex flex-wrap gap-2 items-center text-sm shadow-sm">
        <label className="bg-green-600 text-white px-3 py-1 rounded cursor-pointer flex gap-1"><Upload size={14}/> Import<input type="file" className="hidden" onChange={handleImportExcel}/></label>
        <button onClick={handleDownloadTemplate} className="bg-slate-100 border px-3 py-1 rounded">Template</button>
        <div className="border-l pl-2 flex gap-1 items-center">
            <input type="month" value={exportMonth} onChange={e=>setExportMonth(e.target.value)} className="border rounded px-1"/>
            <button onClick={handleExportMonthly} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex gap-1"><FileSpreadsheet size={14}/> Export Bulanan</button>
        </div>
      </div>
      <div className="bg-slate-50 p-2 rounded border flex gap-2 mb-2"><input placeholder="Nama Siswa Baru..." value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name:e.target.value})} className="flex-1 border p-1 rounded"/><button onClick={addStudent}><Plus/></button></div>
      <div className="overflow-x-auto bg-white border rounded"><table className="w-full text-sm text-left"><thead className="bg-slate-800 text-white"><tr><th className="p-2">No</th><th className="p-2">Nama</th><th className="p-2 text-center bg-blue-700">HADIR</th><th className="p-2 w-8 text-center bg-yellow-600">S</th><th className="p-2 w-8 text-center bg-yellow-600">I</th><th className="p-2 w-8 text-center bg-red-600">A</th><th className="p-2 w-8">Del</th></tr></thead><tbody>
        {students.map((s,i)=>(<tr key={s.id} className="border-b hover:bg-slate-50"><td className="p-2 text-center">{i+1}</td><td className="p-2 font-medium">{s.name}<br/><span className="text-xs text-gray-400">{s.nisn}</span></td><td className="p-2 text-center border-x"><input type="checkbox" checked={s.attendanceHistory?.[selectedDate]==='H'} onChange={e=>updateDaily(s.id, e.target.checked?'H':null)} className="w-5 h-5"/></td><td className="p-1"><input type="number" value={s.recap?.s||0} onChange={e=>updateRecap(s.id,'s',e.target.value)} className="w-10 text-center"/></td><td className="p-1"><input type="number" value={s.recap?.i||0} onChange={e=>updateRecap(s.id,'i',e.target.value)} className="w-10 text-center"/></td><td className="p-1"><input type="number" value={s.recap?.a||0} onChange={e=>updateRecap(s.id,'a',e.target.value)} className="w-10 text-center"/></td><td className="p-2 text-center text-red-500 cursor-pointer" onClick={()=>onUpdateStudents(students.filter(x=>x.id!==s.id))}><Trash2 size={14}/></td></tr>))}
      </tbody></table></div>
    </div>
  );
};

const JournalSection = ({ selectedClass, curriculumData, journalData, setJournalData, selectedDate, identity }) => {
  const [entry, setEntry] = useState({ time: '', scope: '', tp: '', activity: '', reflection: '', followup: '' });
  const addJournal = () => { setJournalData([...journalData, { ...entry, date: selectedDate, id: Date.now(), class: selectedClass || 'Umum' }]); setEntry({ ...entry, activity: '', reflection: '', followup: '' }); };
  const filtered = journalData.filter(j => (j.date === selectedDate) && (!selectedClass || j.class === selectedClass));

  const handleExportJournal = () => {
    if (typeof XLSX === 'undefined') { alert("Fitur Excel belum aktif."); return; }
    const kop = [[identity.schoolName], [identity.schoolAddress], [`JURNAL HARIAN - ${formatDateIndo(selectedDate)}`], []];
    const headers = ["No", "Jam", "Kelas", "Materi", "TP", "Kegiatan", "Refleksi"];
    const rows = filtered.map((j, i) => [i+1, j.time, j.class, j.scope, j.tp, j.activity, j.reflection]);
    const footer = [[],[], ["Mengetahui,", "", "", "", "", "Guru Mapel"], [identity.principalName, "", "", "", "", identity.teacherName]];
    const ws = XLSX.utils.aoa_to_sheet([...kop, headers, ...rows, ...footer]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Jurnal"); XLSX.writeFile(wb, `Jurnal_${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
       <div className="flex justify-between items-center border-b pb-2">
         <h2 className="text-2xl font-bold text-slate-800">4. Jurnal Harian</h2>
         {filtered.length > 0 && <button onClick={handleExportJournal} className="bg-green-600 text-white px-3 py-1 rounded text-xs flex gap-1 hover:bg-green-700"><FileSpreadsheet size={14}/> Export Excel</button>}
      </div>
      <div className="bg-white p-4 rounded shadow border grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold">Jam</label><input className="w-full p-2 border rounded" placeholder="1-2" value={entry.time} onChange={e=>setEntry({...entry, time:e.target.value})}/></div>
          <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold">Materi</label><select className="w-full p-2 border rounded" value={entry.scope} onChange={e=>setEntry({...entry, scope:e.target.value})}><option>-- Pilih --</option>{curriculumData.map(c=><option key={c.id} value={c.scope}>{c.scope}</option>)}</select></div>
          <div className="col-span-2"><label className="text-xs font-bold">Tujuan Pembelajaran</label><textarea className="w-full p-2 border rounded h-20" placeholder="• Poin 1&#10;• Poin 2" value={entry.tp} onChange={e=>setEntry({...entry, tp:e.target.value})}/></div>
          <div className="col-span-2"><label className="text-xs font-bold">Kegiatan</label><textarea className="w-full p-2 border rounded h-24" placeholder="Pendahuluan...&#10;Inti...&#10;Penutup..." value={entry.activity} onChange={e=>setEntry({...entry, activity:e.target.value})}/></div>
          <div><label className="text-xs font-bold">Refleksi</label><textarea className="w-full p-2 border rounded h-16" value={entry.reflection} onChange={e=>setEntry({...entry, reflection:e.target.value})}/></div>
          <div><label className="text-xs font-bold">Tindak Lanjut</label><textarea className="w-full p-2 border rounded h-16" value={entry.followup} onChange={e=>setEntry({...entry, followup:e.target.value})}/></div>
          <div className="col-span-2 text-right"><button onClick={addJournal} className="bg-blue-600 text-white px-6 py-2 rounded shadow">Simpan</button></div>
      </div>
      <div className="space-y-2">
        {filtered.map(j => (
            <div key={j.id} className="bg-white border p-3 rounded text-sm relative group">
                <button onClick={()=>setJournalData(journalData.filter(x=>x.id!==j.id))} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                <div className="flex gap-2 font-bold text-blue-800 mb-1"><span>{j.time}</span><span>|</span><span>{j.scope}</span></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="font-bold text-xs text-slate-500">Kegiatan:</p><pre className="whitespace-pre-wrap font-sans">{j.activity}</pre></div>
                    <div><p className="font-bold text-xs text-slate-500">Refleksi:</p><p>{j.reflection}</p></div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

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
    const titleMap = { formative: 'Formatif', summative: 'Sumatif', attitude: 'Sikap' };
    const columns = type === 'formative' ? Array.from({length: 10}, (_, i) => `TP${i+1}`) : type === 'summative' ? [...Array.from({length: 10}, (_, i) => `LM${i+1}`), 'STS', 'SAS'] : ['Religius', 'Jujur', 'Disiplin', 'Kerjasama', 'Kreatif'];
    const updateScore = (id, col, val) => { const s = students.find(x => x.id === id); const upd = { ...s, [type]: { ...s[type], [col]: val } }; onUpdateStudents(students.map(x => x.id === id ? upd : x)); };
    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-800 border-b pb-2">Penilaian {titleMap[type]}</h2>
            <div className="overflow-x-auto bg-white border rounded shadow-sm"><table className="w-full text-sm text-center border-collapse"><thead className="bg-slate-700 text-white"><tr><th className="p-2 text-left sticky left-0 bg-slate-700 w-10">No</th><th className="p-2 text-left sticky left-8 bg-slate-700 w-48">Nama</th>{columns.map(c=><th key={c} className="p-2 border-l border-slate-600 min-w-[50px]">{c}</th>)}</tr></thead><tbody>{students.map((s,i)=>(<tr key={s.id} className="hover:bg-slate-50 border-b"><td className="p-2 text-left sticky left-0 bg-white border-r">{i+1}</td><td className="p-2 text-left sticky left-8 bg-white border-r truncate max-w-[200px]">{s.name}</td>{columns.map(c=><td key={c} className="p-0 border-r"><input className="w-full text-center p-2 outline-none" value={s[type]?.[c]||''} onChange={e=>updateScore(s.id,c,e.target.value)}/></td>)}</tr>))}</tbody></table></div>
        </div>
    )
};

const ReportSection = ({ identity, selectedClass, students, selectedDate }) => {
    if (!selectedClass) return <div className="p-10 text-center text-slate-500">Pilih Kelas Terlebih Dahulu.</div>;

    const handleExportWord = () => {
        const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Laporan Nilai</title><style>body{font-family:Arial,sans-serif;} table{width:100%;border-collapse:collapse;font-size:11px;} td,th{border:1px solid black;padding:4px;} .kop{text-align:center;margin-bottom:20px;border-bottom:3px double black;padding-bottom:10px;} .kop h2{margin:0;font-size:18px;} .kop p{margin:0;font-size:12px;}</style></head><body>`;
        const kop = `<div class="kop"><h2>PEMERINTAH PROVINSI</h2><h1>${identity.schoolName}</h1><p>${identity.schoolAddress}</p></div>`;
        const title = `<div style="text-align:center; margin-bottom:15px;"><h3>REKAPITULASI NILAI RAPOR</h3><p>Kelas: ${selectedClass} | Tahun: ${identity.academicYear}</p></div>`;
        
        let table = `<table><thead><tr style="background:#eee;"><th>No</th><th>NISN</th><th>Nama Siswa</th><th>H</th><th>S</th><th>I</th><th>A</th><th>R.Form</th><th>R.Sum</th><th>Sikap</th><th>Hadir</th><th>NA</th><th>Pred</th><th>Ket</th></tr></thead><tbody>`;
        students.forEach((s, i) => {
            const st = getAttendanceStats(s);
            const g = calculateFinalGrade(s);
            let p = 'D'; if(g.finalScore>=90) p='A'; else if(g.finalScore>=80) p='B'; else if(g.finalScore>=70) p='C';
            table += `<tr><td style="text-align:center">${i+1}</td><td>${s.name}</td><td style="text-align:center">${st.h}</td><td style="text-align:center">${st.s}</td><td style="text-align:center">${st.i}</td><td style="text-align:center">${st.a}</td><td style="text-align:center">${g.avgFormative}</td><td style="text-align:center">${g.avgSummative}</td><td style="text-align:center">${g.avgAttitude}</td><td style="text-align:center">${g.attendanceScore}</td><td style="text-align:center"><b>${g.finalScore}</b></td><td style="text-align:center">${p}</td><td style="text-align:center">${g.finalScore>=75?'Tuntas':'Belum'}</td></tr>`;
        });
        table += `</tbody></table>`;
        
        const ttd = `<br/><br/><table style="border:none; width:100%;"><tr style="border:none;"><td style="border:none; text-align:center;">Mengetahui,<br/>Kepala Sekolah<br/><br/><br/><br/><u>${identity.principalName}</u><br/>NIP. ${identity.principalNip}</td><td style="border:none;"></td><td style="border:none; text-align:center;">${formatDateIndo(selectedDate)}<br/>Guru Mata Pelajaran<br/><br/><br/><br/><u>${identity.teacherName}</u><br/>NIP. ${identity.nip}</td></tr></table>`;
        
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(header + kop + title + table + ttd + "</body></html>");
        const link = document.createElement("a"); link.href = source; link.download = `Laporan_Nilai_${selectedClass}.doc`; link.click();
    };

    const handleExportExcel = () => {
        if (typeof XLSX === 'undefined') { alert("Fitur Excel belum aktif."); return; }
        const kop = [[identity.schoolName.toUpperCase()], [identity.schoolAddress], [`REKAP NILAI KELAS ${selectedClass}`], []];
        const headers = ["No","NISN","Nama","H","S","I","A","R.Form","R.Sum","Sikap","Nilai Hadir","NA","Pred","Ket"];
        const rows = students.map((s,i) => {
            const st = getAttendanceStats(s);
            const g = calculateFinalGrade(s);
            let p = 'D'; if(g.finalScore>=90) p='A'; else if(g.finalScore>=80) p='B'; else if(g.finalScore>=70) p='C';
            return [i+1, s.nisn, s.name, st.h, st.s, st.i, st.a, g.avgFormative, g.avgSummative, g.avgAttitude, g.attendanceScore, g.finalScore, p, g.finalScore>=75?'Tuntas':'Belum'];
        });
        const ttd = [[],[],["Mengetahui,", "", "", "", "", "", "", "", "Tanggal:", formatDateIndo(selectedDate)],["Kepala Sekolah", "", "", "", "", "", "", "", "Guru Mapel"],[],[],[],[identity.principalName, "", "", "", "", "", "", "", identity.teacherName],[`NIP. ${identity.principalNip}`, "", "", "", "", "", "", "", `NIP. ${identity.nip}`]];
        
        const ws = XLSX.utils.aoa_to_sheet([...kop, headers, ...rows, ...ttd]);
        const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Nilai"); XLSX.writeFile(wb, `Nilai_${selectedClass}.xlsx`);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-2 print:hidden">
                <h2 className="text-2xl font-bold text-slate-800">8. Kelola Nilai Rapor</h2>
                <div className="flex gap-2">
                    <button onClick={handleExportWord} className="bg-blue-600 text-white px-3 py-1 rounded flex gap-1 items-center hover:bg-blue-700"><FileText size={14}/> Word (.doc)</button>
                    <button onClick={handleExportExcel} className="bg-green-600 text-white px-3 py-1 rounded flex gap-1 items-center hover:bg-green-700"><FileSpreadsheet size={14}/> Excel</button>
                    <button onClick={()=>window.print()} className="bg-slate-800 text-white px-3 py-1 rounded flex gap-1 items-center hover:bg-slate-900"><Printer size={14}/> Cetak PDF</button>
                </div>
            </div>
            
            {/* TAMPILAN CETAK / LAYAR */}
            <div className="bg-white p-8 border shadow-sm print:shadow-none print:border-none print:p-0">
                <KopSurat identity={identity} />
                
                <div className="text-center mb-6 hidden print:block">
                    <h2 className="text-xl font-bold">REKAPITULASI NILAI RAPOR</h2>
                    <p>Kelas: {selectedClass} | Tahun: {identity.academicYear} | Semester: {identity.semester}</p>
                </div>

                <table className="w-full text-xs border-collapse border border-black">
                    <thead className="bg-slate-200 print:bg-slate-200">
                        <tr>
                            <th className="border border-black p-1">No</th>
                            <th className="border border-black p-1 text-left">Nama Siswa</th>
                            <th className="border border-black p-1 w-6">H</th>
                            <th className="border border-black p-1 w-6">S</th>
                            <th className="border border-black p-1 w-6">I</th>
                            <th className="border border-black p-1 w-6">A</th>
                            <th className="border border-black p-1 w-10">R.Form</th>
                            <th className="border border-black p-1 w-10">R.Sum</th>
                            <th className="border border-black p-1 w-10">Sikap</th>
                            <th className="border border-black p-1 w-10">N.Hadir</th>
                            <th className="border border-black p-1 w-10 bg-slate-300">NA</th>
                            <th className="border border-black p-1 w-8">Pred</th>
                            <th className="border border-black p-1 w-16">Ket</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s, idx) => {
                            const st = getAttendanceStats(s);
                            const g = calculateFinalGrade(s);
                            let pred = 'D'; if(g.finalScore>=90) pred='A'; else if(g.finalScore>=80) pred='B'; else if(g.finalScore>=70) pred='C';
                            return (
                                <tr key={s.id}>
                                    <td className="border border-black p-1 text-center">{idx+1}</td>
                                    <td className="border border-black p-1">{s.name}</td>
                                    <td className="border border-black p-1 text-center">{st.h}</td>
                                    <td className="border border-black p-1 text-center">{st.s}</td>
                                    <td className="border border-black p-1 text-center">{st.i}</td>
                                    <td className="border border-black p-1 text-center">{st.a}</td>
                                    <td className="border border-black p-1 text-center">{g.avgFormative}</td>
                                    <td className="border border-black p-1 text-center">{g.avgSummative}</td>
                                    <td className="border border-black p-1 text-center">{g.avgAttitude}</td>
                                    <td className="border border-black p-1 text-center">{g.attendanceScore}</td>
                                    <td className="border border-black p-1 text-center font-bold bg-slate-100">{g.finalScore}</td>
                                    <td className="border border-black p-1 text-center">{pred}</td>
                                    <td className="border border-black p-1 text-center font-medium">{g.finalScore>=75?'Tuntas':'Belum'}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {/* Tanda Tangan Cetak */}
                <div className="hidden print:grid grid-cols-3 mt-10 text-sm page-break-inside-avoid">
                    <div className="text-center">
                        <p>Mengetahui,<br/>Kepala Sekolah</p>
                        <br/><br/><br/>
                        <p className="font-bold underline">{identity.principalName}</p>
                        <p>NIP. {identity.principalNip}</p>
                    </div>
                    <div></div>
                    <div className="text-center">
                        <p>{formatDateIndo(selectedDate)}<br/>Guru Mata Pelajaran</p>
                        <br/><br/><br/>
                        <p className="font-bold underline">{identity.teacherName}</p>
                        <p>NIP. {identity.nip}</p>
                    </div>
                </div>
            </div>
        </div>
    )
};

// --- APP COMPONENT ---

const App = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('identity');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load from local storage
  const [identity, setIdentity] = useState(() => JSON.parse(localStorage.getItem('guru_identity')) || initialIdentity);
  const [classList, setClassList] = useState(() => JSON.parse(localStorage.getItem('guru_classList')) || []);
  const [selectedClass, setSelectedClass] = useState(() => localStorage.getItem('guru_selectedClass') || '');
  const [studentsData, setStudentsData] = useState(() => JSON.parse(localStorage.getItem('guru_studentsData')) || {});
  const [curriculumData, setCurriculumData] = useState(() => JSON.parse(localStorage.getItem('guru_curriculumData')) || []);
  const [journalData, setJournalData] = useState(() => JSON.parse(localStorage.getItem('guru_journalData')) || []);

  // Save Effects
  useEffect(() => localStorage.setItem('guru_identity', JSON.stringify(identity)), [identity]);
  useEffect(() => localStorage.setItem('guru_classList', JSON.stringify(classList)), [classList]);
  useEffect(() => localStorage.setItem('guru_selectedClass', selectedClass), [selectedClass]);
  useEffect(() => localStorage.setItem('guru_studentsData', JSON.stringify(studentsData)), [studentsData]);
  useEffect(() => localStorage.setItem('guru_curriculumData', JSON.stringify(curriculumData)), [curriculumData]);
  useEffect(() => localStorage.setItem('guru_journalData', JSON.stringify(journalData)), [journalData]);

  const getCurrentStudents = () => selectedClass ? (studentsData[selectedClass] || []) : [];
  const updateCurrentStudents = (newList) => selectedClass && setStudentsData({ ...studentsData, [selectedClass]: newList });

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} identity={identity} setIdentity={setIdentity} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden print:h-auto print:overflow-visible print:static">
      <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} print:hidden`}>
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">{sidebarOpen && <h1 className="font-bold text-lg tracking-wider">GURU<span className="text-blue-400">APP</span></h1>}<button onClick={()=>setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-800 rounded"><Menu/></button></div>
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
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
          <div className="mt-auto px-4 pt-4"><button onClick={()=>setShowLanding(true)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full"><LogOut size={16}/> {sidebarOpen && "Keluar / Cover"}</button></div>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden print:h-auto print:overflow-visible print:static print:block">
        <header className="bg-white shadow-sm border-b p-4 flex flex-col md:flex-row justify-between items-center z-10 print:hidden gap-4">
            <div><h2 className="text-xl font-bold text-slate-800 uppercase">{identity.subject || 'Mata Pelajaran'}</h2><p className="text-xs text-slate-500">{identity.teacherName}</p></div>
            <div className="flex flex-wrap items-center gap-4"><div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded border border-yellow-200"><CalendarDays size={18} className="text-yellow-700"/><div className="flex flex-col"><span className="text-[10px] text-yellow-800 font-bold uppercase">Tanggal Aktif</span><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"/></div></div><div className="relative"><select className="appearance-none bg-blue-600 text-white font-bold py-2 pl-4 pr-10 rounded-lg cursor-pointer focus:outline-none hover:bg-blue-700" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{classList.length === 0 && <option value="">(Buat Kelas Dulu)</option>}{classList.map(c => <option key={c} value={c}>{c}</option>)}</select><ChevronDown className="absolute right-3 top-3 text-white pointer-events-none" size={16}/></div></div>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8 print:p-0 print:overflow-visible print:h-auto">
            {activeTab === 'identity' && <IdentitySection identity={identity} setIdentity={setIdentity} classList={classList} setClassList={setClassList} selectedClass={selectedClass} setSelectedClass={setSelectedClass}/>}
            {activeTab === 'attendance' && <AttendanceSection selectedClass={selectedClass} students={getCurrentStudents()} onUpdateStudents={updateCurrentStudents} selectedDate={selectedDate} identity={identity}/>}
            {activeTab === 'curriculum' && <CurriculumSection identity={identity} curriculumData={curriculumData} setCurriculumData={setCurriculumData}/>}
            {activeTab === 'journal' && <JournalSection selectedClass={selectedClass} curriculumData={curriculumData} journalData={journalData} setJournalData={setJournalData} selectedDate={selectedDate} identity={identity}/>}
            {activeTab === 'formative' && <AssessmentSection type="formative" selectedClass={selectedClass} students={getCurrentStudents()} onUpdateStudents={updateCurrentStudents}/>}
            {activeTab === 'summative' && <AssessmentSection type="summative" selectedClass={selectedClass} students={getCurrentStudents()} onUpdateStudents={updateCurrentStudents}/>}
            {activeTab === 'attitude' && <AssessmentSection type="attitude" selectedClass={selectedClass} students={getCurrentStudents()} onUpdateStudents={updateCurrentStudents}/>}
            {activeTab === 'report' && <ReportSection identity={identity} selectedClass={selectedClass} students={getCurrentStudents()} selectedDate={selectedDate}/>}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, open }) => (<button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><div>{icon}</div>{open && <span className="font-medium text-sm">{label}</span>}</button>);

export default App;
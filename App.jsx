import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [form, setForm] = useState({
    proje_adi: 'Kraft Makine Dişli Grubu',
    derece: 18,
    dakika: 10,
    saniye: 0,
    sabit: 2.864789,
    modul: 1,
    agiz: 1,
    min_disli: 20,
    max_disli: 100,
    max_sonuc_sayisi: 30
  });

  const [sonucData, setSonucData] = useState(null);
  const [kayitliListe, setKayitliListe] = useState([]);
  const [aktifSekme, setAktifSekme] = useState('hesapla');
  const [loading, setLoading] = useState(false);
  const [mesaj, setMesaj] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleHesapla = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMesaj('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/hesapla', form);
      setSonucData(response.data);
    } catch (err) {
      setMesaj('Bağlantı hatası! Backend sunucusunun çalıştığından emin olun.');
    } finally {
      setLoading(false);
    }
  };

  const kaydetKombinasyon = async (item) => {
    try {
      await axios.post('http://localhost:8000/api/kaydet', {
        proje_adi: form.proje_adi,
        derece: form.derece,
        dakika: form.dakika,
        saniye: form.saniye,
        hedef_deger: sonucData.hedef_deger,
        a: item.a,
        b: item.b,
        c: item.c,
        d: item.d,
        oran: item.oran,
        fark: item.fark,
        notlar: "Atölye Kaydı"
      });
      setMesaj('Kombinasyon başarıyla veritabanına kaydedildi!');
      setTimeout(() => setMesaj(''), 3000);
    } catch (err) {
      setMesaj('Kayıt sırasında hata oluştu.');
    }
  };

  const kayitlariGetir = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/kayitlar');
      setKayitliListe(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleYazdir = () => {
    window.print();
  };

  useEffect(() => {
    if (aktifSekme === 'gecmis') {
      kayitlariGetir();
    }
  }, [aktifSekme]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      
      {/* Yazdırma (A4) Özel Stilleri */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-container { width: 100% !important; margin: 0 !important; padding: 0 !important; background: white !important; color: black !important; border: none !important; box-shadow: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; font-size: 11px !important; }
          th, td { border: 1px solid #94a3b8 !important; padding: 5px !important; color: black !important; }
          th { background-color: #e2e8f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-scroll-fix { max-height: none !important; overflow: visible !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Üst Header ve Sekmeler */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 no-print">
          <div className="flex items-center space-x-3">
            <span className="text-3xl p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">⚙️</span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">GearCalc Pro</h1>
              <p className="text-xs text-slate-400">Yüksek Hassasiyetli Dişli Kombinasyon ve Indexleme Sistemi</p>
            </div>
          </div>
          
          <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-700">
            <button 
              onClick={() => setAktifSekme('hesapla')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${aktifSekme === 'hesapla' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}>
              Hesaplama Paneli
            </button>
            <button 
              onClick={() => setAktifSekme('gecmis')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${aktifSekme === 'gecmis' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}>
              Kayıtlı Arşiv
            </button>
          </div>
        </div>

        {mesaj && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-medium text-sm animate-fadeIn no-print">
            {mesaj}
          </div>
        )}

        {aktifSekme === 'hesapla' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sol Panel: Parametre Formu */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl h-fit space-y-4 no-print">
              <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
                <span>🔧</span> Tezgah Parametreleri
              </h2>
              
              <form onSubmit={handleHesapla} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Proje Adı / İş İsmi</label>
                  <input type="text" name="proje_adi" value={form.proje_adi} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-bold focus:border-blue-500 outline-none" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Derece</label>
                    <input type="number" name="derece" value={form.derece} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-center font-bold focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Dakika</label>
                    <input type="number" name="dakika" value={form.dakika} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-center font-bold focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Saniye</label>
                    <input type="number" name="saniye" value={form.saniye} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-center font-bold focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Tezgah Sabiti</label>
                    <input type="number" step="any" name="sabit" value={form.sabit} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Modül</label>
                    <input type="number" step="any" name="modul" value={form.modul} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Ağız</label>
                    <input type="number" name="agiz" value={form.agiz} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-center font-medium focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Min Diş</label>
                    <input type="number" name="min_disli" value={form.min_disli} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-center font-medium focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Max Diş</label>
                    <input type="number" name="max_disli" value={form.max_disli} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-center font-medium focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Taranıyor ve Hesaplanıyor...</span>
                    </>
                  ) : (
                    <span>🚀 Kombinasyonları Hesapla</span>
                  )}
                </button>
              </form>
            </div>

            {/* Sağ Panel: Sonuçlar & Tablo */}
            <div className="lg:col-span-2 space-y-6 print-container">
              
              {/* Yazdırma Esnasında Görünecek Detaylı Rapor Başlığı */}
              <div className="print-only mb-4 border-b-2 border-slate-800 pb-4">
                <h1 className="text-2xl font-black text-black">GearCalc Pro - Dişli Kombinasyon Raporu</h1>
                <p className="text-sm font-bold text-blue-700 mt-1">Proje Adı: {form.proje_adi}</p>
                <div className="grid grid-cols-2 gap-2 text-xs mt-3 text-slate-700">
                  <div><b>Hedef Açı:</b> {form.derece}° {form.dakika}' {form.saniye}"</div>
                  <div><b>Tezgah Sabiti:</b> {form.sabit} | <b>Modül:</b> {form.modul} | <b>Ağız:</b> {form.agiz}</div>
                  <div><b>Diş Aralığı:</b> Min {form.min_disli} - Max {form.max_disli}</div>
                  <div><b>Hedef Değer:</b> {sonucData?.hedef_deger}</div>
                </div>
              </div>

              {sonucData ? (
                <>
                  {/* Özet Kartları */}
                  <div className="grid grid-cols-3 gap-4 no-print">
                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
                      <span className="text-xs text-slate-400 block">Hedef Değer</span>
                      <span className="text-lg font-black text-blue-400">{sonucData.hedef_deger}</span>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
                      <span className="text-xs text-slate-400 block">Toplam Açı</span>
                      <span className="text-lg font-black text-emerald-400">{sonucData.toplam_derece}°</span>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
                      <span className="text-xs text-slate-400 block">Sinüs Değeri</span>
                      <span className="text-lg font-black text-purple-400">{sonucData.sinus_degeri}</span>
                    </div>
                  </div>

                  {/* Sonuç Tablosu ve Yazdırma Butonu */}
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center no-print">
                      <div>
                        <h3 className="font-bold text-white">En Uygun Sonuçlar (Hata Payına Göre Sıralı)</h3>
                        <span className="text-xs text-slate-400">Proje: <strong className="text-blue-400">{form.proje_adi}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2.5 py-1 bg-slate-900 rounded-full border border-slate-700 text-slate-400">
                          {sonucData.kombinasyonlar.length} Sonuç
                        </span>
                        <button
                          onClick={handleYazdir}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl font-semibold transition-all shadow flex items-center gap-1.5"
                        >
                          <span>🖨️</span> A4 Çıktısı Al
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-[500px] print-scroll-fix">
                      <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
                        <thead className="bg-slate-900/80 sticky top-0 text-slate-400 uppercase text-xs tracking-wider">
                          <tr>
                            <th className="py-3 px-4">#</th>
                            <th className="py-3 px-4 text-center">a (Z1)</th>
                            <th className="py-3 px-4 text-center">b (Z2)</th>
                            <th className="py-3 px-4 text-center">c (Z3)</th>
                            <th className="py-3 px-4 text-center">d (Z4)</th>
                            <th className="py-3 px-4 text-right">Oran</th>
                            <th className="py-3 px-4 text-right">Fark (Hata)</th>
                            <th className="py-3 px-4 text-center no-print">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {sonucData.kombinasyonlar.map((item, index) => (
                            <tr key={index} className={`transition-colors ${index === 0 ? 'bg-blue-600/10' : 'hover:bg-slate-700/30'}`}>
                              <td className="py-3 px-4 font-bold text-slate-400">{index + 1}</td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-blue-400">{item.a}</td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-blue-400">{item.b}</td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-blue-400">{item.c}</td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-blue-400">{item.d}</td>
                              <td className="py-3 px-4 text-right font-mono text-slate-300">{item.oran.toFixed(9)}</td>
                              <td className="py-3 px-4 text-right font-mono text-red-400 font-semibold">{item.fark.toFixed(9)}</td>
                              <td className="py-3 px-4 text-center no-print">
                                <button 
                                  onClick={() => kaydetKombinasyon(item)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-all shadow">
                                  Kaydet
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-800 border border-slate-700 border-dashed rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 min-h-[400px] no-print">
                  <span className="text-4xl">📊</span>
                  <p className="font-medium">Henüz bir hesaplama yapılmadı.</p>
                  <p className="text-xs text-slate-500 max-w-sm">Sol panelden parametreleri belirleyip "Kombinasyonları Hesapla" butonuna tıklayın.</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Geçmiş Arşiv Ekranı */
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden p-6">
            <h2 className="text-lg font-bold text-white mb-4">Veritabanına Kaydedilen Kombinasyon Arşivi</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
                <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4">Tarih</th>
                    <th className="py-3 px-4">Proje Adı</th>
                    <th className="py-3 px-4 text-center">Açı</th>
                    <th className="py-3 px-4 text-center">Hedef Değer</th>
                    <th className="py-3 px-4 text-center">Dişli Grubu (a - b - c - d)</th>
                    <th className="py-3 px-4 text-right">Hata Payı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {kayitliListe.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-slate-400 text-xs">{row.tarih}</td>
                      <td className="py-3 px-4 font-bold text-blue-400">{row.proje_adi || "Genel Proje"}</td>
                      <td className="py-3 px-4 text-center text-slate-300">{row.derece}° {row.dakika}' {row.saniye}"</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-200">{row.hedef_deger}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">{row.a} - {row.b} - {row.c} - {row.d}</td>
                      <td className="py-3 px-4 text-right font-mono text-red-400">{typeof row.fark === 'number' ? row.fark.toFixed(9) : row.fark}</td>
                    </tr>
                  ))}
                  {kayitliListe.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500">Henüz kaydedilmiş bir kombinasyon bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
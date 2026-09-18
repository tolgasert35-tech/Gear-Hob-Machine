from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime
import math

app = FastAPI(title="GearCalc Pro API", version="2.2")

# CORS Ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SQLite Veritabanı ve Otomatik Sütun Güncelleme (Migration) ---
def init_db():
    conn = sqlite3.connect("gearcalc.db")
    cursor = conn.cursor()
    
    # Tabloyu oluştur (Eğer yoksa)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS kayitli_hesaplar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tarih TEXT,
            proje_adi TEXT,
            derece REAL,
            dakika REAL,
            saniye REAL,
            hedef_deger REAL,
            a INTEGER,
            b INTEGER,
            c INTEGER,
            d INTEGER,
            oran REAL,
            fark REAL,
            notlar TEXT
        )
    """)
    
    # Eski veritabanlarında 'proje_adi' sütunu eksikse otomatik ekle
    cursor.execute("PRAGMA table_info(kayitli_hesaplar)")
    sutunlar = [sutun[1] for sutun in cursor.fetchall()]
    if "proje_adi" not in sutunlar:
        cursor.execute("ALTER TABLE kayitli_hesaplar ADD COLUMN proje_adi TEXT DEFAULT 'Genel Proje'")

    conn.commit()
    conn.close()

init_db()

# --- Pydantic Modelleri ---
class GearRequest(BaseModel):
    proje_adi: str = "Kraft Makine Dişli Grubu"
    derece: float
    dakika: float
    saniye: float
    sabit: float
    modul: float
    agiz: float
    min_disli: int
    max_disli: int
    max_sonuc_sayisi: int = 50

class SaveGearRequest(BaseModel):
    proje_adi: str = "Genel Proje"
    derece: float
    dakika: float
    saniye: float
    hedef_deger: float
    a: int
    b: int
    c: int
    d: int
    oran: float
    fark: float
    notlar: str = ""

# --- Yüksek Performanslı Optimize Edilmiş Hesaplama Endpoint'i ---
@app.post("/api/hesapla")
def hesapla_kombinasyonlar(req: GearRequest):
    toplam_derece = req.derece + (req.dakika / 60.0) + (req.saniye / 3600.0)
    radyan = math.radians(toplam_derece)
    hedef_deger = math.sin(radyan) * req.sabit
    
    kombinasyonlar = []
    min_d = req.min_disli
    max_d = req.max_disli
    
    for b in range(min_d, max_d + 1):
        for d in range(min_d, max_d + 1):
            bd = b * d
            for a in range(min_d, max_d + 1):
                ideal_c = (hedef_deger * bd) / a
                c_start = max(min_d, int(ideal_c) - 2)
                c_end = min(max_d, int(ideal_c) + 3)
                
                for c in range(c_start, c_end + 1):
                    oran = (a * c) / bd
                    fark = abs(oran - hedef_deger)
                    
                    kombinasyonlar.append({
                        "a": a,
                        "b": b,
                        "c": c,
                        "d": d,
                        "oran": oran,
                        "fark": fark
                    })

    kombinasyonlar.sort(key=lambda x: x["fark"])
    en_iyi_sonuclar = kombinasyonlar[:req.max_sonuc_sayisi]

    return {
        "hedef_deger": round(hedef_deger, 9),
        "toplam_derece": round(toplam_derece, 4),
        "sinus_degeri": round(math.sin(radyan), 9),
        "kombinasyonlar": en_iyi_sonuclar
    }

# --- Veritabanı Kayıt Endpoint'i ---
@app.post("/api/kaydet")
def kombinasyon_kaydet(item: SaveGearRequest):
    conn = sqlite3.connect("gearcalc.db")
    cursor = conn.cursor()
    tarih = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO kayitli_hesaplar (tarih, proje_adi, derece, dakika, saniye, hedef_deger, a, b, c, d, oran, fark, notlar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (tarih, item.proje_adi, item.derece, item.dakika, item.saniye, item.hedef_deger, item.a, item.b, item.c, item.d, item.oran, item.fark, item.notlar))
    conn.commit()
    conn.close()
    return {"durum": "basarili", "mesaj": "Kombinasyon başarıyla kaydedildi!"}

# --- Kayıtlı Arşivi Getirme Endpoint'i ---
@app.get("/api/kayitlar")
def kayitlari_getir():
    conn = sqlite3.connect("gearcalc.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM kayitli_hesaplar ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    liste = []
    for row in rows:
        liste.append(dict(row))
        
    return liste
if __name__ == "__main__":
    import uvicorn
    import webbrowser
    import threading

    def tarayiciyi_ac():
        webbrowser.open("http://localhost:5173")

    threading.Timer(1.5, tarayiciyi_ac).start()
    uvicorn.run(app, host="127.0.0.1", port=8000)
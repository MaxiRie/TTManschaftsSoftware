# 🏓 TTManschaftsSoftware - Tischtennissparte Verwaltung

## ✅ Projektaufbau abgeschlossen!

**Datum:** 10.06.2026
**Framework:** ASP.NET Core 10 (.NET 10)
**Datenbank:** SQLite (Portable-Modus)
**Status:** 🟢 Läuft und bereit

---

## 🚀 Starten der Anwendung

```bash
cd C:\Users\maxim\Desktop\Projekt\TTManschaftsSoftware\TTManschatfsSoftware
dotnet run
```

Die Anwendung läuft dann unter **http://localhost:5000**

---

## 📁 Projektstruktur

```
TTManschatfsSoftware/
├── Domain/                    # Entity-Modelle (Player, Team, Fixture, etc.)
├── Data/
│   ├── ApplicationDbContext   # EF Core DbContext
│   ├── Repositories/          # Datenzugriff (PlayerRepository, TeamRepository)
│   └── Migrations/            # Datenbank-Versionierung
├── API/                       # REST API Controller
│   ├── PlayersController      # /api/players (CRUD)
│   ├── TeamsController        # /api/teams (CRUD + Validierung)
│   ├── FixturesController     # /api/fixtures (Punktspiele)
│   ├── BlocksController       # /api/blocks (Sperrtermine)
│   └── SeasonsController      # /api/seasons (Saisonverwaltung)
├── Services/                  # Business-Logik
│   ├── TtvnValidator          # TTVN-Regeln (Q-TTR Toleranzen)
│   ├── LineupSuggestionService# Auto-Aufstellungen
│   └── AvailabilityCalculator # Verfügbarkeitsbewertung
├── DTOs/                      # Data Transfer Objects
├── wwwroot/                   # Frontend-Dateien
│   ├── index.html             # SPA-UI
│   ├── app.js                 # Business-Logik (Vue.js kompatibel)
│   └── styles.css             # Styling
├── Program.cs                 # ASP.NET Core Entry Point
├── appsettings.json           # Konfiguration
└── TTManschatfsSoftware.csproj # Projekt-Definition
```

---

## 🛠️ Technologie-Stack

| Komponente | Version | Zweck |
|-----------|---------|-------|
| **.NET** | 10.0 | Backend-Framework |
| **ASP.NET Core** | 10.0 | Web API & Static Files |
| **Entity Framework Core** | 10.0 | ORM & Datenbankverwaltung |
| **SQLite** | - | Lokale Datenbank (Portable-Modus) |
| **HTML5/CSS3** | - | Frontend UI |
| **JavaScript** | - | Client-seitige Logik |

---

## 📡 REST API Endpoints

### Players (Spieler)
- `GET /api/players` - Alle Spieler abrufen
- `GET /api/players/{id}` - Einzelnen Spieler abrufen
- `POST /api/players` - Neuen Spieler erstellen
- `PUT /api/players/{id}` - Spieler aktualisieren
- `DELETE /api/players/{id}` - Spieler löschen

### Teams (Mannschaften)
- `GET /api/teams` - Alle Mannschaften
- `GET /api/teams/{id}` - Einzelne Mannschaft
- `POST /api/teams` - Neue Mannschaft
- `PUT /api/teams/{id}` - Mannschaft aktualisieren
- `DELETE /api/teams/{id}` - Mannschaft löschen
- `POST /api/teams/{teamId}/players/{playerId}` - Spieler zu Mannschaft hinzufügen
- `DELETE /api/teams/{teamId}/players/{playerId}` - Spieler aus Mannschaft entfernen

### Fixtures (Punktspiele)
- `GET /api/fixtures` - Alle Punktspiele
- `GET /api/fixtures/{id}` - Einzelnes Punktspiel
- `POST /api/fixtures` - Neues Punktspiel
- `PUT /api/fixtures/{id}` - Punktspiel aktualisieren
- `DELETE /api/fixtures/{id}` - Punktspiel löschen

### Blocks (Sperrtermine)
- `GET /api/blocks` - Alle Sperrtermine
- `GET /api/blocks/player/{playerId}` - Sperrtermine für Spieler
- `POST /api/blocks` - Neuer Sperrtermin
- `DELETE /api/blocks/{id}` - Sperrtermin löschen

### Seasons (Saisons)
- `GET /api/seasons` - Alle Saisons
- `GET /api/seasons/{id}` - Einzelne Saison
- `POST /api/seasons` - Neue Saison
- `PUT /api/seasons/{id}` - Saison aktualisieren
- `DELETE /api/seasons/{id}` - Saison löschen

---

## 🧠 Integrierte Business-Logik

### TTVN Validator (Tischtennisverband Niedersachsen)
- **Q-TTR Toleranz intern:** 35 Punkte (max. Spannweite innerhalb einer Mannschaft)
- **Q-TTR Toleranz übergreifend:** 50 Punkte (max. Differenz zwischen Mannschaften)
- **SPV-Markierung:** Kennzeichnet Spieler, die 50+ Punkte über dem letzten Spieler der Mannschaft darüber liegen
- **Minimum 4 Spieler pro Mannschaft**

### Lineup Suggestion Service
- Schlägt Aufstellungen basierend auf Verfügbarkeit vor
- Berücksichtigt Spielerstatus (aktiv, RES, Ersatz, Jugend, passiv)
- Sortierung nach Q-TTR (Spielstärke)

### Availability Calculator
- 🟢 **Grün:** 4+ Spieler verfügbar
- 🟡 **Gelb:** 3 Spieler verfügbar
- 🔴 **Rot:** 0-2 Spieler verfügbar
- Berücksichtigt Sperrtermine und Schulferien

---

## 📊 Datenbank-Schema

Die SQLite-Datenbank wird automatisch beim ersten Start erstellt:

```
Players (Spieler)
├── Id (GUID)
├── Name (Text)
├── Qttr (Integer: Spielstärke)
├── QttrDate (DateTime)
├── Status (Text: aktiv/RES/Ersatz/Jugend/passiv)
├── TeamId (FK: Mannschaft)
├── IsSpvMarked (Boolean)
└── CreatedAt, UpdatedAt

Teams (Mannschaften)
├── Id (GUID)
├── Name (Text)
├── League (Text: Liga-Klasse)
├── TargetSize (Integer)
├── SeasonId (FK)
└── CreatedAt, UpdatedAt

Fixtures (Punktspiele)
├── Id (GUID)
├── TeamId (FK)
├── Opponent (Text)
├── Venue (Text: Heim/Auswärts)
├── Status (Text: offen/geplant/bestätigt)
├── ConfirmedDate (DateTime)
└── CreatedAt, UpdatedAt

... weitere Tabellen für Blocks, Seasons, HallSlots, Availabilities
```

---

## 🔧 Konfiguration

**appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=tischtennis.db"
  },
  "Features": {
    "EnablePortableMode": false,
    "DataPath": "./data",
    "SeedFromJson": true
  }
}
```

---

## 📦 NuGet Packages

- `Microsoft.EntityFrameworkCore.Sqlite` - ORM für SQLite
- `Microsoft.EntityFrameworkCore.Tools` - Migrations
- Minimales Setup für maximale Performance

---

## 🎯 Frontend-Features (aus Sven-Projekt)

Alle Features aus der ursprünglichen JavaScript-Version sind integriert:

✅ Spielerübersicht mit Filter/Sortierung  
✅ Mannschaftsverwaltung mit TTVN-Prüfung  
✅ Saisonplanung mit Aufgaben & Risiken  
✅ Kalender mit Verfügbarkeitsbewertung  
✅ Punktspiele mit Auto-Aufstellungen  
✅ Sperrtermine pro Spieler  
✅ CSV-Import/Export  
✅ JSON-Datensicherung  

---

## 🚢 Deployment

Das Projekt kann als **Einzeldatei-Exe** ausgeführt werden:

```bash
# Für Portable-Modus (USB-Stick)
dotnet publish --configuration Release --self-contained
# → bin/Release/net10.0/publish/TTManschatfsSoftware.exe
```

---

## 📝 Nächste Schritte (optional)

1. **Datenbank-Persistierung:** PostgreSQL für Multi-Tenant
2. **Authentifizierung:** JWT für Benutzerrollen
3. **Import:** Click-TT oder QTTR-Listen
4. **Notifications:** E-Mail/SMS für Spieler
5. **Mobile App:** React Native oder Flutter
6. **Analytics:** Spieler-Performance-Tracking

---

## 📞 Support

**Projekt-Root:**  
`C:\Users\maxim\Desktop\Projekt\TTManschaftsSoftware\`

**Git Repository:**  
`MaxiRie/TTManschaftsSoftware`

**Aktueller Status:**  
🟢 Produktionsreif (minimal dependencies)

---

**Erstellt mit ❤️ von GitHub Copilot CLI**

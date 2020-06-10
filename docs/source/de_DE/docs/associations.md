---
title: Assoziationen
layout: page
---

## Automatisches erstellen/aktualisieren

GORM speichert beim Erstellen / Aktualisieren eines Datensatzes automatisch Assoziationen und deren Referenz. Wenn die Verknüpfung einen Primärschlüssel hat, ruft GORM `Update` auf, um es zu speichern, andernfalls wird sie erstellt.

```go
user := User{
  Name:            "jinzhu",
  BillingAddress:  Address{Address1: "Billing Address - Address 1"},
  ShippingAddress: Address{Address1: "Shipping Address - Address 1"},
  Emails:          []Email{
    {Email: "jinzhu@example.com"},
    {Email: "jinzhu-2@example.com"},
  },
  Languages:       []Language{
    {Name: "ZH"},
    {Name: "EN"},
  },
}

db.Create(&user)
//// BEGIN TRANSACTION;
//// INSERT INTO "addresses" (address1) VALUES ("Billing Address - Address 1");
//// INSERT INTO "addresses" (address1) VALUES ("Shipping Address - Address 1");
//// INSERT INTO "users" (name,billing_address_id,shipping_address_id) VALUES ("jinzhu", 1, 2);
//// INSERT INTO "emails" (user_id,email) VALUES (111, "jinzhu@example.com");
//// INSERT INTO "emails" (user_id,email) VALUES (111, "jinzhu-2@example.com");
//// INSERT INTO "languages" ("name") VALUES ('ZH');
//// INSERT INTO user_languages ("user_id","language_id") VALUES (111, 1);
//// INSERT INTO "languages" ("name") VALUES ('EN');
//// INSERT INTO user_languages ("user_id","language_id") VALUES (111, 2);
//// COMMIT;

db.Save(&user)
```

## AutoUpdate überspringen

Wenn die Zuordnungen bereits in der Datenbank vorhanden sind, möchte man sie möglicherweise nicht aktualisieren.

Hierzu kann man die Datenbank-Einstellung `gorm:association_autoupdate` auf `false` setzen

```go
// Assoziationen mit Primärschlüssel werden nicht aktualisiert,
// aber die Referenz wird gespeichert
db.Set("gorm:association_autoupdate", false).Create(&user)
db.Set("gorm:association_autoupdate", false).Save(&user)
```

oder GORM Tags nutzen, `gorm:"association_autoupdate:false"`

```go
type User struct {
  gorm.Model
  Name       string
  CompanyID  uint
  // Aktualisiert keine Verknüpfungen mit Primärschlüssel, speichert aber
  // die Referenz
  Company    Company `gorm:"association_autoupdate:false"`
}
```

## AutoCreate überspringen

Selbst bei deaktiviertem `AutoUpdating` werden Assoziationen ohne Primärschlüssel erstellt und ihre Referenz wird gespeichert.

Um dies zu deaktivieren, können Sie die Datenbank-Einstellung `gorm: association_autocreate` auf `false` setzen

```go
// Erstelle keine Assoziationen ohne Primärschlüssel,
// speichere die Referenz NICHT
db.Set("gorm:association_autocreate", false).Create(&user)
db.Set("gorm:association_autocreate", false).Save(&user)
```

oder GORM Tags nutzen, `gorm:"association_autocreate:false"`

    type User struct {
      gorm.Model
      Name       string
      // Erstelle keine Assoziationen ohne Primärschlüssel,
      // speicher die Referenz NICHT 
     Company1   Company `gorm:"association_autocreate:false"`
    }
    

## AutoCreate/Update überspringen

Um `AutoCreate` und `AutoUpdate` zu deaktivieren, kann man beide Einstellungen zusammen verwenden

```go
db.Set("gorm:association_autoupdate", false).Set("gorm:association_autocreate", false).Create(&user)

type User struct {
  gorm.Model
  Name    string
  Company Company `gorm:"association_autoupdate:false;association_autocreate:false"`
}
```

Oder verwende `gorm:save_associations`

    db.Set("gorm:save_associations", false).Create(&user)
    db.Set("gorm:save_associations", false).Save(&user)
    
    type User struct {
      gorm.Model
      Name    string
      Company Company `gorm:"save_associations:false"`
    }
    

## Speichern der Referenz überspringen

Wenn man beim aktualisieren / apeichern von Daten nicht einmal die Assoziationsreferenz speichern möchten, kann man die folgenden Einstellungen verwenden

```go
db.Set("gorm:association_save_reference", false).Save(&user)
db.Set("gorm:association_save_reference", false).Create(&user)
```

oder den Tag

```go
type User struct {
  gorm.Model
  Name       string
  CompanyID  uint
  Company    Company `gorm:"association_save_reference:false"`
}
```

## Assoziations-Modus

Der Assoziations-Modus hat einige Hilfsfunktionen, um Beziehungen zu vereinfachen.

```go
// Start Association Mode
var user User
db.Model(&user).Association("Languages")
// `user` is the source, must contains primary key
// `Languages` is source's field name for a relationship
// AssociationMode can only works if above two conditions both matched, check it ok or not:
// db.Model(&user).Association("Languages").Error
```

### Assoziationen finden

Finde passende Assoziationen

```go
db.Model(&user).Association("Languages").Find(&languages)
```

### Assoziationen hinzufügen

Füge neue Zuordnungen für `many to many` und `has many` hinzu, ersetzt die aktuelle Zuordnung für `has one`, `belongs to`

```go
db.Model(&user).Association("Languages").Append([]Language{languageZH, languageEN})
db.Model(&user).Association("Languages").Append(Language{Name: "DE"})
```

### Assoziationen ersetzen

Aktuelle Assoziationen durch neue ersetzen

```go
db.Model(&user).Association("Languages").Replace([]Language{languageZH, languageEN})
db.Model(&user).Association("Languages").Replace(Language{Name: "DE"}, languageEN)
```

### Assoziationen löschen

Das Löschen von Assoziationen löscht nur die Referenz, nicht die Objekte in der Datenbank.

```go
db.Model(&user).Association("Languages").Delete([]Language{languageZH, languageEN})
db.Model(&user).Association("Languages").Delete(languageZH, languageEN)
```

### Assoziationen entfernen

Entferne die Referenz zwischen quelle & der momentanen Assoziation, löscht nicht diese Assoziationen

```go
db.Model(&user).Association("Languages").Clear()
```

### Assoziationen zählen

Gibt die Anzahl der aktuellen Assoziationen zurück

```go
db.Model(&user).Association("Languages").Count()
```
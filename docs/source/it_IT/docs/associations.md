---
title: Associazioni
layout: page
---

## Crea/Aggiorna automaticamente

GORM salverà automaticamente le associazioni e i relativi riferimenti durante la creazione/aggiornamento di un record. Se l'associazione ha una chiave primaria, GORM chiamerà `Update` per salvarlo, altrimenti verrà creato.

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

## Salta aggiornamento automatico

Se la tua associazione è già esistente nel database, potresti non volerla aggiornare.

Puoi usare le impostazioni del Database, imposta `gorm:association_autoupdate` a `false`

```go
// Non aggiorna le associazioni che hanno la chiave primaria, ma salverà il riferimento
db.Set("gorm:association_autoupdate", false).Create(&user)
db.Set("gorm:association_autoupdate", false).Save(&user)
```

oppure usa le tag di GORM `gorm:"association_autoupdate:false"`

```go
type User struct {
  gorm.Model
  Name       string
  CompanyID  uint
  // Non aggiorna le associazioni che hanno la chiave primaria, ma salverà il riferimento
  Company    Company `gorm:"association_autoupdate:false"`
}
```

## Salta la creazione automatica

Anche se si disattiva l'`AutoUpdating`, le associazioni senza chiave primaria devono ancora essere create e il suo riferimento verrà salvato.

Per disabilitare questo, puoi farlo dalle impostazioni del database `gorm:association_autocreate` a `false`

```go
// Non creare associazioni con la chiave primaria. NON VERRA' salvato il riferimento
db.Set("gorm:association_autocreate", false).Create(&user)
db.Set("gorm:association_autocreate", false).Save(&user)
```

oppure usa le tag di GORM, `gorm:"association_autocreate:false"`

    type User struct {
      gorm.Model
      Name       string
      // Don't create associations w/o primary key, WON'T save its reference
      Company1   Company `gorm:"association_autocreate:false"`
    }
    

## Salta la Creazione/Aggiornamento automatico

Per disabilitare sia `AutoCreate` che `AutoUpdate`, puoi usare queste due impostazioni insieme

```go
db.Set("gorm:association_autoupdate", false).Set("gorm:association_autocreate", false).Create(&user)

type User struct {
  gorm.Model
  Name    string
  Company Company `gorm:"association_autoupdate:false;association_autocreate:false"`
}
```

Oppure usa `gorm:save_associations`

    db.Set("gorm:save_associations", false).Create(&user)
    db.Set("gorm:save_associations", false).Save(&user)
    
    type User struct {
      gorm.Model
      Name    string
      Company Company `gorm:"save_associations:false"`
    }
    

## Salta il salvataggio dei riferimenti

Se non si desidera salvare il riferimento dell'associazione durante l'aggiornamento/salvataggio dei dati, è possibile utilizzare i seguenti trucchetti

```go
db.Set("gorm:association_save_reference", false).Save(&user)
db.Set("gorm:association_save_reference", false).Create(&user)
```

oppure usa i tag

```go
type User struct {
  gorm.Model
  Name       string
  CompanyID  uint
  Company    Company `gorm:"association_save_reference:false"`
}
```

## Modalità associazione

La modalità associazione contiene alcuni metodi di supporto per gestire facilmente la correlazione alle relazioni.

```go
// Start Association Mode
var user User
db.Model(&user).Association("Languages")
// `user` is the source, must contains primary key
// `Languages` is source's field name for a relationship
// AssociationMode can only works if above two conditions both matched, check it ok or not:
// db.Model(&user).Association("Languages").Error
```

### Trova le associazioni

Trova le associazioni abbinate

```go
db.Model(&user).Association("Languages").Find(&languages)
```

### Aggiungi le associazioni

Aggiungi nuove associazioni per `many to many`, `has many`, sostituisci le associazioni per `has one`, `belong to`

```go
db.Model(&user).Association("Languages").Append([]Language{languageZH, languageEN})
db.Model(&user).Association("Languages").Append(Language{Name: "DE"})
```

### Sostituisci le associazioni

Sostituisci le associazioni correnti con delle nuove

```go
db.Model(&user).Association("Languages").Replace([]Language{languageZH, languageEN})
db.Model(&user).Association("Languages").Replace(Language{Name: "DE"}, languageEN)
```

### Cancella le associazioni

Rimuove il riferimento tra la fonte & l'argomento oggetto, rimuove solo il riferimento non cancella l'oggetto dal database.

```go
db.Model(&user).Association("Languages").Delete([]Language{languageZH, languageEN})
db.Model(&user).Association("Languages").Delete(languageZH, languageEN)
```

### Libera le associazioni

Rimuove il riferimento tra fonte & l'associazione corrente, non cancellerà le associzioni

```go
db.Model(&user).Association("Languages").Clear()
```

### Conta le associazioni

Restituisce il conteggio delle associazioni attuali

```go
db.Model(&user).Association("Languages").Count()
```
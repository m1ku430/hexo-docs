---
title: Asociaciones
layout: page
---

## Creación/Actualización Automática

GORM guardará automáticamente asociaciones y su referencia cuando crea/actualiza un registro. Si una asociación tiene una clave principal, GORM pedirá `Actualizar` para guardarla, de lo contrario será creado.

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

## Saltar Actualización Automática

Si su asociación ya existe en la base de datos, podría no querer actualizarla.

Usted podría utilizar la configuración de BD, establezca `gorm:association_autoupdate` a `falso`

```go
// No actualizar asociaciones que tengan clave principal, pero guardar referencia
db.Set("gorm:association_autoupdate", false).Create(&user)
db.Set("gorm:association_autoupdate", false).Save(&user)
```

o utilice etiquetas GORM, `gorm:"association_autoupdate:false"`

```go
type User struct {
  gorm.Model
  Name       string
  CompanyID  uint
  // No actualiza las asociaciones que tienen una clave primaria, pero guarda la referencia
  Company    Company `gorm:"association_autoupdate:false"`
}
```

## Saltar Creación Automática

Aún cuando haya deshabilitado `AutoUpdating`, asociaciones sin clave principal aún deben ser creadas y su referencia será guardada.

Para deshabilitar esto, puede establecer la configuración DB `gorm:association_autocreate` a `falso`

```go
//No crear asociaciones sin la clave principal, NO guardará su referencia
db.Set("gorm:association_autocreate", false).Create(&user)
db.Set("gorm:association_autocreate", false).Save(&user)
```

o use etiquetas GORM, `gorm:"association_autocreate:false"`

    type User struct {
      gorm.Model
      Name       string
      // No crea asociaciones sin clave principal, NO guardará su referencia
      Company1   Company `gorm:"association_autocreate:false"`
    }
    

## Saltar Creación/Actualización Automática

Para deshabilitar tanto `AutoCreate` como `AutoUpdate`, puedes utilizar dos settings juntas

```go
db.Set("gorm:association_autoupdate", false).Set("gorm:association_autocreate", false).Create(&user)

type User struct {
  gorm.Model
  Name    string
  Company Company `gorm:"association_autoupdate:false;association_autocreate:false"`
}
```

O utilice `gorm:save_associations`

    db.Set("gorm:save_associations", false).Create(&user)
    db.Set("gorm:save_associations", false).Save(&user)
    
    type User struct {
      gorm.Model
      Name    string
      Company Company `gorm:"save_associations:false"`
    }
    

## Saltar Guardado de Referencia

Si no desea guardar la referencia de asociación cuando actualiza/guarda datos, puede utilizar los siguientes trucos

```go
db.Set("gorm:association_save_reference", false).Save(&user)
db.Set("gorm:association_save_reference", false).Create(&user)
```

o usar la etiqueta

```go
type User struct {
  gorm.Model
  Name       string
  CompanyID  uint
  Company    Company `gorm:"association_save_reference:false"`
}
```

## Modo de Asociación

El Modo de Asociación contiene métodos de ayuda para manejar cosas relativas con relaciones fácilmente.

```go
// Iniciar modo asociación
var user User
db.Model(&user).Association("Languages")
// `user` es la fuente, debe contener clave primaria
// `Languages` es el nombre del campo que contendrá la relación
// Modo asociación solo puede funcionar si las dos condiciones anteriores se satisfacen, comprobar siempre que esté correcto:
// db.Model(&user).Association("Languages").Error
```

### Buscar Asociaciones

Encontrar asociaciones compatibles

```go
db.Model(&user).Association("Languages").Find(&languages)
```

### Añadir Asociaciones

Añadir nuevas asociaciones para `numerosas`, `tiene numerosas`, reemplazar asociaciones actuales por `tiene una`,`pertenece a`

```go
db.Model(&user).Association("Languages").Append([]Language{languageZH, languageEN})
db.Model(&user).Association("Languages").Append(Language{Name: "ES"})
```

### Reemplazar Asociaciones

Reemplazar asociaciones actuales con otras nuevas

```go
db.Model(&user).Association("Languages").Replace([]Language{languageZH, languageEN})
db.Model(&user).Association("Languages").Replace(Language{Name: "ES"}, languageEN)
```

### Eliminar Asociaciones

Eliminar relación entre la fuente & objetos de argumento, solo eliminar la referencia, no eliminará esos objetos de DB.

```go
db.Model(&user).Association("Languages").Delete([]Language{languageES, languageEN})
db.Model(&user).Association("Languages").Delete(languageES, languageEN)
```

### Limpiar Asociaciones

Remover referencias entre la fuente & las asociaciones actuales, no removerá las asociaciones

```go
db.Model(&user).Association("Languages").Clear()
```

### Contar asociaciones

Devuelve la cantidad de asociaciones actuales

```go
db.Model(&user).Association("Languages").Count()
```
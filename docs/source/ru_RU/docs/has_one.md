---
title: Has One
layout: страница
---

## Has One

Связь `has one` "имеет одну" также делает связь один к одному с другой моделью, но с несколько разными семантиками (и последствиями). Эта ассоциация указывает, что каждый экземпляр модели содержит или обладает одним из экземпляров другой модели.

Например, если ваше приложение включает в себя пользователей и кредитные карты, и каждый пользователь может иметь одну кредитную карту.

```go
// User имеет одну CreditCard, CreditCardID является внешним ключем
type CreditCard struct {
  gorm.Model
  Number   string
  UserID   uint
}

type User struct {
  gorm.Model
  CreditCard   CreditCard
}
```

## Foreign Key

Для связи has one "имеет одну", поле внешнего ключа должно существовать, владелец будет сохранять первичный ключ принадлежащей поделив это поле.

Название поля генерируется с помощью `has one` типа модели, плюс его `primary key`, для примера ниже, это `UserID`.

Когда вы задаете кредитную карту модели пользователя, она сохранит `ID` кредитной карты в поле `CreditCardID`.

Если вы хотите использовать другое поле для сохранения отношений, вы можете изменить его с тегом `foreignkey`, например:

```go
type CreditCard struct {
  gorm.Model
  Number   string
  UserName string
}

type User struct {
  gorm.Model
  CreditCard CreditCard `gorm:"foreignkey:UserName"`
}
```

## Association ForeignKey

По умолчанию, сущность владелец сохранит `has one` первичный ключ модели во внешний ключ, для сохранения в другое поле вы можете изменить, например, использовать `Name` для примера ниже.

```go
type CreditCard struct {
  gorm.Model
  Number string
  UID    string
}

type User struct {
  gorm.Model
  Name       `sql:"index"`
  CreditCard CreditCard `gorm:"foreignkey:uid;association_foreignkey:name"`
}
```

## Polymorphism Association

Поддерживает полиморфические `has many` и `has one` ассоциации.

```go
type Cat struct {
  ID    int
  Name  string
  Toy   Toy `gorm:"polymorphic:Owner;"`
}

type Dog struct {
  ID   int
  Name string
  Toy  Toy `gorm:"polymorphic:Owner;"`
}

type Toy struct {
  ID        int
  Name      string
  OwnerID   int
  OwnerType string
}
```

Примечание: полиморфический belongs-to "принадлежит к" и many-to-many "многие ко многим" не поддерживаются, и будут выводить ошибки.

## Работа с Has One

Вы можете найти `has one` связи с помощью `Related`

```go
var card CreditCard
db.Model(&user).Related(&card, "CreditCard")
//// SELECT * FROM credit_cards WHERE user_id = 123; // 123 это первичный ключ пользователя
// CreditCard это название поля в таблице user, это значит получить пользовательские связи с CreditCard и записать в переменную card
// Если название поле совпадает с названием переменной, как в примере ниже, его можно опустить, например:
db.Model(&user).Related(&card)
```

Для расширенного использования, смотрите [Режим связей](associations.html#Association-Mode)
---
title: Logger
layout: page
---

## Logger

Gorm telah memiliki dukungan logger built-in, mode bawaan, itu hanya akan mencetak log Bila ada kesalahan terjadi.

```go
// Enable Logger, show detailed log
db.LogMode(true)

// Disable Logger, don't show any log even errors
db.LogMode(false)

// Debug a single operation, show detailed log for this operation
db.Debug().Where("name = ?", "jinzhu").First(&User{})
```

## Customize Logger

Refer GORM's default logger for how to customize it <https://github.com/jinzhu/gorm/blob/master/logger.go>

For example, using [Revel](https://revel.github.io/)'s Logger as the backend for GORM

```go
db.SetLogger(gorm.Logger{revel.TRACE})
```

Using `os.Stdout` as the backend

```go
db.SetLogger(log.New(os.Stdout, "\r\n", 0))
```
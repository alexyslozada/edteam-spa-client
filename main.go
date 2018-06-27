package main

import "github.com/labstack/echo"

func main() {
	e := echo.New()
	e.Static("/", "public")
	e.Start(":9494")
}

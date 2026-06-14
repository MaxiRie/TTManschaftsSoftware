using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TTManschatfsSoftware.Migrations
{
    /// <inheritdoc />
    public partial class SeedAuthRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AppRoles",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("7a34b7f4-3c0c-4a84-b2d5-31e8060dc56a"), "Vollzugriff auf Verwaltung, Benutzer und Stammdaten", "Admin" },
                    { new Guid("9f5b5611-cb77-43ac-a4e2-df39fbc30a8c"), "Pflege von Teams, Saisonplanung und Turnieren", "Trainer" },
                    { new Guid("bfc0208f-3408-4a68-a5e5-321677f55eb8"), "Eigene Verfuegbarkeit und Einsicht in Planung", "Spieler" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AppRoles",
                keyColumn: "Id",
                keyValue: new Guid("7a34b7f4-3c0c-4a84-b2d5-31e8060dc56a"));

            migrationBuilder.DeleteData(
                table: "AppRoles",
                keyColumn: "Id",
                keyValue: new Guid("9f5b5611-cb77-43ac-a4e2-df39fbc30a8c"));

            migrationBuilder.DeleteData(
                table: "AppRoles",
                keyColumn: "Id",
                keyValue: new Guid("bfc0208f-3408-4a68-a5e5-321677f55eb8"));
        }
    }
}

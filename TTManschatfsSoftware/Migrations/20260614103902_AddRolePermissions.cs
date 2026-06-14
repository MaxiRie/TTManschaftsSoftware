using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TTManschatfsSoftware.Migrations
{
    /// <inheritdoc />
    public partial class AddRolePermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AppRoles",
                keyColumn: "Id",
                keyValue: new Guid("9f5b5611-cb77-43ac-a4e2-df39fbc30a8c"),
                columns: new[] { "Description", "Name" },
                values: new object[] { "Punktspiele der eigenen Mannschaft anlegen und bearbeiten", "Mannschaftsfuehrer" });

            migrationBuilder.UpdateData(
                table: "AppRoles",
                keyColumn: "Id",
                keyValue: new Guid("bfc0208f-3408-4a68-a5e5-321677f55eb8"),
                column: "Description",
                value: "Kalender, Punktspiele, Sperrtermine, Turniere und Mannschaften ansehen");

            migrationBuilder.InsertData(
                table: "AppRoles",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { new Guid("a6788e41-1ec4-4c1f-8626-1771ac729fed"), "Turniere erstellen und verwalten", "Turnierleiter" },
                    { new Guid("a9e78f7c-88f5-4b5d-bd58-5340371d25f2"), "Spieler, Saisonplanung, Uebersicht und Mannschaften verwalten", "Vereinsleiter" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AppRoles",
                keyColumn: "Id",
                keyValue: new Guid("a6788e41-1ec4-4c1f-8626-1771ac729fed"));

            migrationBuilder.DeleteData(
                table: "AppRoles",
                keyColumn: "Id",
                keyValue: new Guid("a9e78f7c-88f5-4b5d-bd58-5340371d25f2"));

            migrationBuilder.UpdateData(
                table: "AppRoles",
                keyColumn: "Id",
                keyValue: new Guid("9f5b5611-cb77-43ac-a4e2-df39fbc30a8c"),
                columns: new[] { "Description", "Name" },
                values: new object[] { "Pflege von Teams, Saisonplanung und Turnieren", "Trainer" });

            migrationBuilder.UpdateData(
                table: "AppRoles",
                keyColumn: "Id",
                keyValue: new Guid("bfc0208f-3408-4a68-a5e5-321677f55eb8"),
                column: "Description",
                value: "Eigene Verfuegbarkeit und Einsicht in Planung");
        }
    }
}

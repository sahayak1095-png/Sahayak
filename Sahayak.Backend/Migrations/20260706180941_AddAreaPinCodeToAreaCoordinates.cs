using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sahayak.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAreaPinCodeToAreaCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PinCode",
                table: "AreaCoordinates",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PinCode",
                table: "AreaCoordinates");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Artify_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSubmissionReviewFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ArtworkId",
                table: "ArtworkSubmissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReviewedByUserId",
                table: "ArtworkSubmissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "ArtworkSubmissions",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.CreateIndex(
                name: "IX_ArtworkSubmissions_Status",
                table: "ArtworkSubmissions",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ArtworkSubmissions_Status",
                table: "ArtworkSubmissions");

            migrationBuilder.DropColumn(
                name: "ArtworkId",
                table: "ArtworkSubmissions");

            migrationBuilder.DropColumn(
                name: "ReviewedByUserId",
                table: "ArtworkSubmissions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "ArtworkSubmissions");
        }
    }
}

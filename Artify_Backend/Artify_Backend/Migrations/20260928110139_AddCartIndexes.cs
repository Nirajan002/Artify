using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Artify_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCartIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId",
                table: "CartItems");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId_ArtworkVariantId",
                table: "CartItems",
                columns: new[] { "CartId", "ArtworkVariantId" },
                unique: true,
                filter: "[ArtworkVariantId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CartItems_CartId_ArtworkVariantId",
                table: "CartItems");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_CartId",
                table: "CartItems",
                column: "CartId");
        }
    }
}

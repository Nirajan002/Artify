using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Artify_Backend.Migrations
{
    /// <inheritdoc />
    public partial class updatedAddOrderItemSnapshotFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ItemImageUrl",
                table: "OrderItems",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ItemImageUrl",
                table: "OrderItems");
        }
    }
}

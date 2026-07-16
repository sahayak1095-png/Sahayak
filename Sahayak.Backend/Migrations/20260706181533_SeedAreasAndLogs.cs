using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sahayak.Backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedAreasAndLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
INSERT INTO ""AreaCoordinates"" (""Id"", ""AreaName"", ""PinCode"", ""Latitude"", ""Longitude"", ""CreatedAt"") VALUES
(1, 'MG Road / Bangalore GPO', '560001', 12.9773, 77.5714, '2026-07-06T00:00:00Z'),
(2, 'Bangalore City', '560002', 12.9775, 77.5730, '2026-07-06T00:00:00Z'),
(3, 'Malleswaram', '560003', 13.0027, 77.5646, '2026-07-06T00:00:00Z'),
(4, 'Basavanagudi', '560004', 12.9422, 77.5738, '2026-07-06T00:00:00Z'),
(5, 'Frazer Town', '560005', 12.9982, 77.6122, '2026-07-06T00:00:00Z'),
(6, 'Agaram', '560007', 12.9992, 77.5899, '2026-07-06T00:00:00Z'),
(7, 'Gandhinagar', '560009', 12.9765, 77.5677, '2026-07-06T00:00:00Z'),
(8, 'Rajajinagar', '560010', 12.9911, 77.5528, '2026-07-06T00:00:00Z'),
(9, 'Yeshwanthpur', '560022', 13.0284, 77.5540, '2026-07-06T00:00:00Z'),
(10, 'Hebbal', '560024', 13.0359, 77.5970, '2026-07-06T00:00:00Z'),
(11, 'Adugodi', '560030', 12.9534, 77.6189, '2026-07-06T00:00:00Z'),
(12, 'Koramangala', '560034', 12.9352, 77.6146, '2026-07-06T00:00:00Z'),
(13, 'Carmelaram', '560035', 12.8000, 77.6800, '2026-07-06T00:00:00Z'),
(14, 'Sarjapur', '560035', 12.9090, 77.6701, '2026-07-06T00:00:00Z'),
(15, 'Marathahalli', '560037', 12.9569, 77.7011, '2026-07-06T00:00:00Z'),
(16, 'Indiranagar', '560038', 12.9784, 77.6408, '2026-07-06T00:00:00Z'),
(17, 'Jayanagar', '560041', 12.9308, 77.5838, '2026-07-06T00:00:00Z'),
(18, 'Banaswadi', '560043', 13.0018, 77.6211, '2026-07-06T00:00:00Z'),
(19, 'Nagawara / Manyata area', '560045', 13.0095, 77.5936, '2026-07-06T00:00:00Z'),
(20, 'Benson Town', '560046', 12.9944, 77.6010, '2026-07-06T00:00:00Z'),
(21, 'Austin Town', '560047', 12.9880, 77.6180, '2026-07-06T00:00:00Z'),
(22, 'Banashankari', '560050', 12.9250, 77.5460, '2026-07-06T00:00:00Z'),
(23, 'Chickpet', '560053', 12.9762, 77.5600, '2026-07-06T00:00:00Z'),
(24, 'Bangalore University', '560056', 12.9477, 77.4988, '2026-07-06T00:00:00Z'),
(25, 'Dasarahalli', '560057', 13.0354, 77.4860, '2026-07-06T00:00:00Z'),
(26, 'Doddakallasandra', '560062', 12.8738, 77.5926, '2026-07-06T00:00:00Z'),
(27, 'Yelahanka', '560064', 13.1005, 77.5963, '2026-07-06T00:00:00Z'),
(28, 'GKVK', '560065', 13.0847, 77.5797, '2026-07-06T00:00:00Z'),
(29, 'Whitefield', '560066', 12.9698, 77.7500, '2026-07-06T00:00:00Z'),
(30, 'Bommanahalli', '560068', 12.9089, 77.6222, '2026-07-06T00:00:00Z'),
(31, 'Banashankari 2nd Stage', '560070', 12.9143, 77.5488, '2026-07-06T00:00:00Z'),
(32, 'Domlur', '560071', 12.9611, 77.6387, '2026-07-06T00:00:00Z'),
(33, 'BTM Layout', '560076', 12.9166, 77.6101, '2026-07-06T00:00:00Z'),
(34, 'Bannerghatta Road', '560076', 12.9040, 77.5950, '2026-07-06T00:00:00Z'),
(35, 'JP Nagar', '560078', 12.9077, 77.5851, '2026-07-06T00:00:00Z'),
(36, 'Basaveshwaranagar', '560079', 12.9735, 77.5221, '2026-07-06T00:00:00Z'),
(37, 'Bannerghatta', '560083', 12.8740, 77.5950, '2026-07-06T00:00:00Z'),
(38, 'Banashankari 3rd Stage', '560085', 12.9044, 77.5365, '2026-07-06T00:00:00Z'),
(39, 'Chikkabanavara', '560090', 13.0762, 77.4911, '2026-07-06T00:00:00Z'),
(40, 'Amruthahalli / Byatarayanapura', '560092', 13.0200, 77.5660, '2026-07-06T00:00:00Z'),
(41, 'CV Raman Nagar', '560093', 12.9836, 77.6650, '2026-07-06T00:00:00Z'),
(42, 'Bommasandra Industrial Area', '560099', 12.8430, 77.7082, '2026-07-06T00:00:00Z'),
(43, 'Electronic City', '560100', 12.8452, 77.6602, '2026-07-06T00:00:00Z'),
(44, 'HSR Layout', '560102', 12.9121, 77.6446, '2026-07-06T00:00:00Z'),
(45, 'Bellandur', '560103', 12.9260, 77.6762, '2026-07-06T00:00:00Z'),
(46, 'Anjanapura', '560108', 12.8689, 77.5569, '2026-07-06T00:00:00Z'),
(47, 'Devanahalli', '562110', 13.1985, 77.7091, '2026-07-06T00:00:00Z'),
(48, 'Hoskote', '562114', 13.0092, 77.8107, '2026-07-06T00:00:00Z'),
(49, 'Nelamangala', '562123', 13.1599, 77.3147, '2026-07-06T00:00:00Z'),
(50, 'Attibele', '562107', 12.7875, 77.7149, '2026-07-06T00:00:00Z'),
(51, 'Hongasandra', '560114', 12.9103, 77.6683, '2026-07-06T00:00:00Z')
ON CONFLICT (""Id"") DO NOTHING;");

            migrationBuilder.Sql(@"
INSERT INTO ""ServiceLogs"" (""Id"", ""PersonName"", ""TaskDescription"", ""ServiceType"", ""CreatedAt"") VALUES
(1, 'Ravi K.', 'Medicine pickup', 'Errands', '2026-07-06T00:00:00Z'),
(2, 'Fatima S.', 'RTO queue standing', 'Errands', '2026-07-06T00:00:00Z'),
(3, 'The Iyers', 'Deep kitchen clean', 'Cleaning', '2026-07-06T00:00:00Z'),
(4, 'Ananya R.', 'Evening walk companion', 'Elder Care', '2026-07-06T00:00:00Z'),
(5, 'Suresh M.', 'AC servicing', 'Maintenance', '2026-07-06T00:00:00Z'),
(6, 'Priya D.', 'Tiffin prep — 5 days', 'Cooking', '2026-07-06T00:00:00Z')
ON CONFLICT (""Id"") DO NOTHING;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""AreaCoordinates"" WHERE ""Id"" BETWEEN 1 AND 50;");
            migrationBuilder.Sql(@"DELETE FROM ""ServiceLogs"" WHERE ""Id"" BETWEEN 1 AND 6;");
        }
    }
}

const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/lokasi", async (req, res) => {
    const kota = req.query.kota || "Banyuwangi";

    const apiKey = "7BbU9YZblAWc9U7uW73N";

    const url = `https://api.maptiler.com/geocoding/${kota}.json?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (!data.features || data.features.length === 0) {
            return res.status(404).json({
                message: "Lokasi tidak ditemukan"
            });
        }

        const lokasi = data.features[0].matching_text;
        const koordinat = data.features[0].geometry.coordinates;

        let negara = "-";
        let provinsi = "-";
        let kecamatan = "-";

        if (data.features[0].context) {
            feature.context.forEach(ctx => {
                if (ctx.id.startsWith("country")) negara = ctx.text;
                if (ctx.id.startsWith("region") || ctx.id.startsWith("province")) provinsi = ctx.text;
                if (ctx.id.startsWith("subdistrict") || ctx.id.startsWith("district") || ctx.id.startsWith("locality")) {
                    kecamatan = ctx.text;
                }
            });
        }

        if (kecamatan === "-" && feature.place_type && feature.place_type.includes("subdistrict")) {
            kecamatan = feature.text;
        }

        res.json({
            lokasiInput: kota,
            namaTempat: feature.place_name || feature.text || kota,
            negara: negara,
            provinsi: provinsi,
            kecamatan: kecamatan,
            longitude: longitude,
            latitude: latitude
        });

} catch (error) {
        console.error("Error MapTiler API:", error.message);
        res.status(500).json({
            message: "Gagal load data lokasi dari MapTiler"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
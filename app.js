const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));

app.get("/api/lokasi", async (req, res) => {
    const kota = req.query.kota || "tokyo";
    const apiKey = "7BbU9YZblAWc9U7uW73N";

    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(kota)}.json?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (!data.features || data.features.length === 0) {
            return res.status(404).json({ message: "Lokasi tidak ditemukan" });
        }

        const feature = data.features[0];
        const [longitude, latitude] = feature.geometry.coordinates;

        let negara = "-";
        let provinsi = "-";
        let kecamatan = "-";

        // 1. Cari hirarki dari context bawaan MapTiler
        if (feature.context) {
            feature.context.forEach(ctx => {
                if (ctx.id.startsWith("country")) negara = ctx.text;
                if (ctx.id.startsWith("region") || ctx.id.startsWith("province")) provinsi = ctx.text;
                if (
                    ctx.id.startsWith("subdistrict") || 
                    ctx.id.startsWith("district") || 
                    ctx.id.startsWith("locality") ||
                    ctx.id.startsWith("place")
                ) {
                    kecamatan = ctx.text;
                }
            });
        }

        // 2. Jika kecamatan masih tidak ditemukan di context, gunakan teks lokasi utama
        if (kecamatan === "-") {
            kecamatan = feature.text || kota;
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
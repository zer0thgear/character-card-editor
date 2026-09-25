import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";

import formatBytes from "../../utils/formatBytes";

const SIZE_PRESETS = [2048, 1536, 1024, 768, 512];

async function describeImage(dataUrl) {
    const [img, blob] = await Promise.all([
        imageCompression.loadImage(dataUrl),
        fetch(dataUrl).then((r) => r.blob()),
    ]);
    return {dataUrl, width: img.naturalWidth, height: img.naturalHeight, bytes: blob.size};
}

/**
 * Lets the user downscale the card portrait to cut the exported PNG's size. Always compresses from
 * `source` (the portrait as originally uploaded/loaded), so picking a different size, or "Original",
 * never stacks losses from an earlier compression.
 *
 * @param {boolean} open
 * @param {string} source Data URL of the original portrait
 * @param {*} onClose
 * @param {*} onApply Called with the chosen portrait's data URL
 */
const PortraitCompressionDialog = ({open, source, onClose, onApply}) => {
    const [original, setOriginal] = useState(null);
    const [maxSide, setMaxSide] = useState("original");
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setMaxSide("original");
        setOriginal(null);
        setResult(null);
        let cancelled = false;
        describeImage(source).then((info) => { if (!cancelled) setOriginal(info); });
        return () => { cancelled = true; };
    }, [source]);

    useEffect(() => {
        if (!open || !original) return;
        if (maxSide === "original") {
            setResult(original);
            setError(null);
            setBusy(false);
            return;
        }
        let cancelled = false;
        setBusy(true);
        setError(null);
        (async () => {
            const file = await imageCompression.getFilefromDataUrl(original.dataUrl, "portrait.png");
            const compressed = await imageCompression(file, {maxWidthOrHeight: maxSide, fileType: "image/png", useWebWorker: true});
            return describeImage(await imageCompression.getDataUrlFromFile(compressed));
        })()
            .then((info) => { if (!cancelled) setResult(info); })
            .catch((err) => { if (!cancelled) setError(`Couldn't compress the portrait: ${err.message}`); })
            .finally(() => { if (!cancelled) setBusy(false); });
        return () => { cancelled = true; };
    }, [open, original, maxSide]);

    const longestSide = original ? Math.max(original.width, original.height) : 0;
    const presets = SIZE_PRESETS.filter((size) => size < longestSide);

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="compress-portrait-title" fullWidth maxWidth="sm">
            <DialogTitle id="compress-portrait-title">Compress portrait</DialogTitle>
            <DialogContent>
                <Typography color="text.secondary" variant="body2" sx={{mb: 2}}>
                    The portrait is usually most of the card's file size. Scaling it down to a maximum width or height
                    shrinks it a lot; most frontends display portraits well under 1024px.
                </Typography>
                {original &&
                    <>
                        <Typography variant="overline" color="text.secondary">Longest side</Typography>
                        <ToggleButtonGroup
                            exclusive
                            fullWidth
                            onChange={(event, value) => { if (value !== null) setMaxSide(value); }}
                            size="small"
                            sx={{mb: 2}}
                            value={maxSide}
                        >
                            <ToggleButton value="original">Original</ToggleButton>
                            {presets.map((size) => <ToggleButton key={size} value={size}>{size}px</ToggleButton>)}
                        </ToggleButtonGroup>
                        {presets.length === 0 &&
                            <Typography color="text.secondary" variant="body2" sx={{mb: 2}}>
                                This portrait is already 512px or smaller, so there's nothing to scale down.
                            </Typography>
                        }
                    </>
                }
                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                <Stack alignItems="center" spacing={1.5}>
                    <Box sx={{height: 240, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative"}}>
                        {result && <img alt="Compressed portrait preview" src={result.dataUrl} style={{maxHeight: "100%", maxWidth: "100%", objectFit: "contain", opacity: busy ? 0.4 : 1}}/>}
                        {(busy || !result) && <CircularProgress sx={{position: "absolute"}}/>}
                    </Box>
                    {original && result &&
                        <Typography variant="body2">
                            {original.width} × {original.height} · {formatBytes(original.bytes)}
                            {" → "}
                            <strong>{result.width} × {result.height} · {formatBytes(result.bytes)}</strong>
                        </Typography>
                    }
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button disabled={busy || !result} onClick={() => onApply(result.dataUrl)} variant="contained">Apply</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PortraitCompressionDialog;

import { Typography, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { getLegendItems } from "../../utils/legendItems";

export default function LegendTable({ metric }) {
    const items = getLegendItems(metric);

    // 👉 จัดกลุ่มละ 2
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
        rows.push(items.slice(i, i + 2));
    }

    return (
        <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                เกณฑ์{metric === "rain" ? "ปริมาณฝน" : "อุณหภูมิ"}
            </Typography>

            <TableContainer>
                <Table
                    size="small"
                    sx={{
                        "& td": {
                            padding: "4px 8px",   // คุมความแน่นของตาราง
                            verticalAlign: "middle",
                        },
                    }}
                >
                    <TableBody>
                        {rows.map((pair, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {pair.flatMap((item, itemIndex) => [
                                    // 🔵 สี
                                    <TableCell
                                        key={`color-${rowIndex}-${itemIndex}`}
                                        sx={{
                                            width: 24,
                                            textAlign: "center",
                                            paddingRight: 0,
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: 12,
                                                height: 12,
                                                borderRadius: "50%",
                                                backgroundColor: item.color,
                                                border: "1px solid #666",
                                            }}
                                        />
                                    </TableCell>,

                                    // 📝 label
                                    <TableCell
                                        key={`label-${rowIndex}-${itemIndex}`}
                                        sx={{
                                            whiteSpace: "nowrap",
                                            paddingLeft: 4,
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {item.label}
                                        </Typography>
                                    </TableCell>,
                                ])}

                                {/* กรณีเหลือ item เดียว เติมช่องว่างให้ครบ 2 */}
                                {pair.length === 1 && (
                                    <>
                                        <TableCell />
                                        <TableCell />
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </>
    );
}

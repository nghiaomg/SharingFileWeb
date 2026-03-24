"use client";

import { useState, useEffect } from "react";
import { FileIcon, Folder, Download, Eye, Table as TableIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { formatBytes } from "@/lib/format";
import { determineFileType } from "@/lib/file-utils";
import { Dialog, Flex, Text, IconButton, ScrollArea, Table, Grid, Card, Box, Spinner, Button } from "@radix-ui/themes";

interface FileItemPreview {
    id: string;
    name: string;
    type: string | null;
    size: number;
    createdAt: string;
    accessMode?: string;
}

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    itemType: "pdf" | "xlsx" | "folder" | "unknown";
    fileUrl?: string; // For PDF/XLSX download or object URL
    folderChildren?: FileItemPreview[]; // For folder view
    isLoading?: boolean;
    onDownloadFile?: (file: FileItemPreview) => void;
}

export function PreviewModal({
    isOpen,
    onClose,
    itemName,
    itemType,
    fileUrl,
    folderChildren,
    isLoading,
    onDownloadFile
}: PreviewModalProps) {
    const [sheetData, setSheetData] = useState<(string | number)[][] | null>(null);
    const [sheetLoading, setSheetLoading] = useState(false);
    const [sheetError, setSheetError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && itemType === "xlsx" && fileUrl) {
            setSheetLoading(true);
            setSheetError(null);
            fetch(fileUrl)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = e.target?.result;
                            const workbook = XLSX.read(data, { type: "binary" });
                            const firstSheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[firstSheetName];
                            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                            setSheetData(json as (string | number)[][]);
                        } catch (err: unknown) {
                            if (err instanceof Error) {
                                setSheetError("Không thể đọc file Excel: " + err.message);
                            } else {
                                setSheetError("Không thể đọc file Excel");
                            }
                        } finally {
                            setSheetLoading(false);
                        }
                    };
                    reader.readAsBinaryString(blob);
                })
                .catch(err => {
                    setSheetError("Lỗi tải file: " + err.message);
                    setSheetLoading(false);
                });
        } else {
            setSheetData(null);
        }
    }, [isOpen, itemType, fileUrl]);

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => {
            if (!open) onClose();
        }}>
            <Dialog.Content maxWidth="900px" style={{ height: "85vh", display: "flex", flexDirection: "column", padding: 0 }}>
                <Flex justify="between" align="center" p="4" style={{ borderBottom: "1px solid var(--gray-a6)" }}>
                    <Dialog.Title style={{ margin: 0 }}>
                        <Flex align="center" gap="2">
                            {itemType === "pdf" && <FileIcon className="w-5 h-5" color="var(--red-9)" />}
                            {itemType === "xlsx" && <TableIcon className="w-5 h-5" color="var(--jade-9)" />}
                            {itemType === "folder" && <Folder className="w-5 h-5" color="var(--blue-9)" />}
                            {itemType === "unknown" && <Eye className="w-5 h-5" color="var(--indigo-9)" />}
                            <Text truncate>Xem trước: {itemName}</Text>
                        </Flex>
                    </Dialog.Title>
                    <Dialog.Close>
                        <IconButton variant="ghost" color="gray">
                            <Eye className="w-4 h-4 hidden" /> {/* Dummy to fix type */}
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor"/>
                            </svg>
                        </IconButton>
                    </Dialog.Close>
                </Flex>

                <Box flexGrow="1" style={{ overflow: "hidden", position: "relative", backgroundColor: "var(--gray-a2)" }}>
                    {isLoading || (itemType === "xlsx" && sheetLoading) ? (
                        <Flex direction="column" align="center" justify="center" height="100%">
                            <Spinner size="3" />
                            <Text mt="3" color="gray">Đang tải dữ liệu...</Text>
                        </Flex>
                    ) : itemType === "pdf" && fileUrl ? (
                         <iframe src={fileUrl} className="w-full h-full border-0" title="PDF Preview" style={{ width: "100%", height: "100%", border: "none" }} />
                    ) : itemType === "xlsx" ? (
                        sheetError ? (
                            <Flex align="center" justify="center" height="100%">
                                <Text color="red" weight="bold">{sheetError}</Text>
                            </Flex>
                        ) : sheetData ? (
                            <ScrollArea style={{ height: "100%" }}>
                                <Table.Root variant="surface">
                                    <Table.Header>
                                        {sheetData[0] && (
                                            <Table.Row>
                                                {sheetData[0].map((col: string | number, index: number) => (
                                                    <Table.ColumnHeaderCell key={index}>
                                                        {col || ""}
                                                    </Table.ColumnHeaderCell>
                                                ))}
                                            </Table.Row>
                                        )}
                                    </Table.Header>
                                    <Table.Body>
                                        {sheetData.slice(1).map((row: (string | number)[], rowIndex: number) => (
                                            <Table.Row key={rowIndex}>
                                                {sheetData[0].map((_, colIndex) => (
                                                    <Table.Cell key={colIndex}>
                                                        {row[colIndex] || ""}
                                                    </Table.Cell>
                                                ))}
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table.Root>
                            </ScrollArea>
                        ) : (
                            <Flex align="center" justify="center" height="100%">
                                <Text color="gray">Không có dữ liệu</Text>
                            </Flex>
                        )
                    ) : itemType === "folder" ? (
                        <ScrollArea style={{ height: "100%" }}>
                            <Box p="4">
                                {!folderChildren || folderChildren.length === 0 ? (
                                    <Flex align="center" justify="center" py="9">
                                        <Text color="gray">Thư mục trống</Text>
                                    </Flex>
                                ) : (
                                    <Grid columns={{ initial: "1", sm: "2", md: "3", lg: "4" }} gap="4">
                                        {folderChildren.map((child) => {
                                            const fileMeta = determineFileType(child.type || "");
                                            const Icon = fileMeta.icon;
                                            return (
                                                <Card key={child.id} variant="surface">
                                                    <Flex gap="3" align="center" mb={onDownloadFile && child.type !== "folder" ? "3" : "0"}>
                                                        <Box width="40px" height="40px" style={{ 
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                            borderRadius: '8px', 
                                                            backgroundColor: "var(--gray-a3)" 
                                                        }}>
                                                            <Icon className={`w-5 h-5`} style={{ color: "var(--gray-11)" }} />
                                                        </Box>
                                                        <Box style={{ minWidth: 0, flex: 1 }}>
                                                            <Text as="div" size="2" weight="bold" truncate>{child.name}</Text>
                                                            <Text as="div" size="1" color="gray">
                                                                {child.type === "folder" ? "Thư mục" : formatBytes(child.size)}
                                                            </Text>
                                                        </Box>
                                                    </Flex>
                                                    
                                                    {onDownloadFile && child.type !== "folder" && (
                                                        <Box mt="3">
                                                            <Button 
                                                                variant="soft" 
                                                                size="1" 
                                                                style={{ width: "100%" }}
                                                                onClick={() => onDownloadFile(child)}
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                Tải xuống
                                                            </Button>
                                                        </Box>
                                                    )}
                                                </Card>
                                            )
                                        })}
                                    </Grid>
                                )}
                            </Box>
                        </ScrollArea>
                    ) : (
                        <Flex direction="column" align="center" justify="center" height="100%" p="6" style={{ textAlign: "center" }}>
                            <Eye className="w-12 h-12 mb-4" style={{ opacity: 0.2 }} />
                            <Text size="4" weight="bold" mb="2">Định dạng không hỗ trợ xem trước</Text>
                            <Text color="gray" style={{ maxWidth: 400 }}>
                                Vui lòng tải xuống tệp để xem định dạng này. Tính năng xem trước hỗ trợ tệp PDF, bảng tính Excel, và Thư mục.
                            </Text>
                        </Flex>
                    )}
                </Box>
            </Dialog.Content>
        </Dialog.Root>
    );
}

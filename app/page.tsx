"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Upload, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as mammoth from "mammoth";

export default function Home() {
  const [vivekInputText, setVivekInputText] = useState("");
  const [vivekSummary, setVivekSummary] = useState("");
  const [vivekEditableSummary, setVivekEditableSummary] = useState("");
  const [vivekLoading, setVivekLoading] = useState(false);
  const [vivekCompressionRatio, setVivekCompressionRatio] = useState([30]);
  const [vivekMethod, setVivekMethod] = useState("extractive");
  const { toast } = useToast();

  const vivekHandleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const vivekFile = e.target.files?.[0];
    if (!vivekFile) return;

    // Custom file size validation
    const vivekMaxSize = 5 * 1024 * 1024; // 5MB
    if (vivekFile.size > vivekMaxSize) {
      toast({
        title: "File Size Exceeded",
        description: `Please upload a file smaller than ${
          vivekMaxSize / (1024 * 1024)
        }MB`,
        variant: "destructive",
      });
      return;
    }

    // Custom file type validation
    const vivekAllowedTypes = [".txt", ".md", ".doc", ".docx"];
    const vivekFileExtension =
      "." + vivekFile.name.split(".").pop()?.toLowerCase();
    if (!vivekAllowedTypes.includes(vivekFileExtension)) {
      toast({
        title: "Invalid File Type",
        description: `Please upload a file with one of these extensions: ${vivekAllowedTypes.join(
          ", "
        )}`,
        variant: "destructive",
      });
      return;
    }

    try {
      let vivekText = "";

      if (vivekFileExtension === ".docx") {
        const vivekArrayBuffer = await vivekFile.arrayBuffer();
        const vivekResult = await mammoth.extractRawText({
          arrayBuffer: vivekArrayBuffer,
        });
        vivekText = vivekResult.value;
      } else {
        vivekText = await vivekFile.text();
      }

      setVivekInputText(vivekText);
      toast({
        title: "File Uploaded",
        description: "File has been successfully processed",
      });
    } catch (error) {
      console.error("File processing error:", error);
      toast({
        title: "File Processing Failed",
        description:
          "Could not process the uploaded file. Please ensure it's a valid text or DOCX file.",
        variant: "destructive",
      });
    }
  };

  const vivekHandleSummarize = async () => {
    if (!vivekInputText.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter or upload some text to summarize",
        variant: "destructive",
      });
      return;
    }

    setVivekLoading(true);
    try {
      const vivekResponse = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: vivekInputText,
          ratio: vivekCompressionRatio[0] / 100,
          method: vivekMethod,
        }),
      });

      if (!vivekResponse.ok) {
        const vivekErrorData = await vivekResponse.json();
        throw new Error(vivekErrorData.error || "Summarization failed");
      }

      const vivekData = await vivekResponse.json();
      setVivekSummary(vivekData.summary);
      setVivekEditableSummary(vivekData.summary);

      toast({
        title: "Summary Generated",
        description: "Text has been successfully summarized",
      });
    } catch (error) {
      console.error("Summarization error:", error);
      toast({
        title: "Summarization Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during summarization",
        variant: "destructive",
      });
    } finally {
      setVivekLoading(false);
    }
  };

  const vivekDownloadSummary = () => {
    const vivekElement = document.createElement("a");
    const vivekFile = new Blob([vivekEditableSummary], { type: "text/plain" });
    vivekElement.href = URL.createObjectURL(vivekFile);
    vivekElement.download = "vivek_summary.txt";
    document.body.appendChild(vivekElement);
    vivekElement.click();
    document.body.removeChild(vivekElement);
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Vivek's Text Summarization Tool
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>Paste your text or upload a file</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your text here..."
              className="min-h-[300px]"
              value={vivekInputText}
              onChange={(e) => setVivekInputText(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center">
              <Input
                type="file"
                id="vivek-file-upload"
                className="hidden"
                accept=".txt,.md,.doc,.docx"
                onChange={vivekHandleFileUpload}
              />
              <Label htmlFor="vivek-file-upload" className="cursor-pointer">
                <Button
                  variant="outline"
                  type="button"
                  className="flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload File
                </Button>
              </Label>
            </div>
            <Button
              onClick={vivekHandleSummarize}
              disabled={vivekLoading || !vivekInputText.trim()}
              className="flex items-center gap-2"
            >
              {vivekLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Summarize
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Edit the generated summary if needed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="view" className="mb-4">
              <TabsList className="mb-2">
                <TabsTrigger value="view">View</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
              </TabsList>
              <TabsContent
                value="view"
                className="min-h-[300px] p-4 border rounded-md"
              >
                {vivekSummary ? (
                  <div className="whitespace-pre-wrap">{vivekSummary}</div>
                ) : (
                  <div className="text-muted-foreground text-center h-full flex items-center justify-center">
                    Summary will appear here
                  </div>
                )}
              </TabsContent>
              <TabsContent value="edit">
                <Textarea
                  className="min-h-[300px]"
                  value={vivekEditableSummary}
                  onChange={(e) => setVivekEditableSummary(e.target.value)}
                  placeholder="Edit your summary here..."
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setVivekEditableSummary(vivekSummary)}
              disabled={!vivekSummary}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Reset
            </Button>
            <Button
              onClick={vivekDownloadSummary}
              disabled={!vivekEditableSummary}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Summarization Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Compression Ratio: {vivekCompressionRatio}%</Label>
              </div>
              <Slider
                value={vivekCompressionRatio}
                onValueChange={setVivekCompressionRatio}
                min={10}
                max={50}
                step={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Summarization Method</Label>
              <div className="flex gap-4">
                <Button
                  variant={vivekMethod === "extractive" ? "default" : "outline"}
                  onClick={() => setVivekMethod("extractive")}
                >
                  Extractive
                </Button>
                <Button
                  variant={vivekMethod === "frequency" ? "default" : "outline"}
                  onClick={() => setVivekMethod("frequency")}
                >
                  Frequency-based
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

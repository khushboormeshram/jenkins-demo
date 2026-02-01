import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Link, Image, Loader2, Cloud } from 'lucide-react';
import { uploadService } from '@/services/upload.service';
import { toast } from 'sonner';

export function ImageUpload({ value, onChange, label = "Image", className = "", useInternalTabs = true, mode = "upload", showLabel = true }) {
    const [isUploading, setIsUploading] = useState(false);
    const [urlInput, setUrlInput] = useState(value || '');
    const [activeTab, setActiveTab] = useState('upload');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        console.log('File selected:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        try {
            // Validate file first
            try {
                uploadService.validateImageFile(file);
                console.log('File validation passed');
            } catch (validationError) {
                console.error('Validation error:', validationError);
                toast.error(validationError.message);
                return;
            }

            setIsUploading(true);

            // Upload file to S3
            console.log('Starting S3 upload...');
            const response = await uploadService.uploadQuestionImage(file);
            console.log('S3 upload response:', response);

            if (response.success) {
                const imageUrl = response.data.url; // S3 URLs are already complete
                onChange(imageUrl);
                toast.success('Image uploaded successfully to S3!');
            } else {
                console.error('Upload failed:', response);
                toast.error(response.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Upload error:', error);

            // Handle different types of errors
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error('Failed to upload image. Please try again.');
            }
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            toast.success('Image URL added successfully!');
        }
    };

    const handleRemoveImage = async () => {
        if (value && uploadService.isS3Url(value)) {
            try {
                // Try to delete from S3
                await uploadService.deleteQuestionImage(value);
                toast.success('Image removed from S3');
            } catch (error) {
                console.error('Failed to delete from S3:', error);
                toast.warning('Image removed locally (S3 deletion failed)');
            }
        } else {
            toast.success('Image removed');
        }
        
        onChange('');
        setUrlInput('');
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const UploadPane = (
        <>
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            {isUploading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            ) : (
                                <Cloud className="w-6 h-6 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                {isUploading ? 'Uploading to S3...' : 'Click to upload to AWS S3'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                JPEG, JPG, PNG, GIF, WebP up to 5MB
                            </p>
                        </div>
                        <div className="flex gap-2 justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={triggerFileSelect}
                                disabled={isUploading}
                                className="gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Choose File
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </>
    );

    const UrlPane = (
        <>
            <div className="flex gap-2">
                <Input
                    type="url"
                    placeholder="Enter image URL (e.g., https://example.com/image.png)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1"
                />
                <Button
                    type="button"
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim()}
                    className="gap-2"
                >
                    <Link className="w-4 h-4" />
                    Add
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                Paste a URL to an image hosted online or S3
            </p>
        </>
    );

    return (
        <div className={`space-y-3 ${className}`}>
            {showLabel && (
                <Label className="text-sm sm:text-base font-medium">{label}</Label>
            )}

            {useInternalTabs ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                            <Cloud className="w-4 h-4" />
                            Upload to S3
                        </TabsTrigger>
                        <TabsTrigger value="url" className="flex items-center gap-2">
                            <Link className="w-4 h-4" />
                            Image URL
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-3">
                        {UploadPane}
                    </TabsContent>

                    <TabsContent value="url" className="space-y-3">
                        {UrlPane}
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="space-y-3">
                    {mode === 'upload' ? UploadPane : UrlPane}
                </div>
            )}

            {/* Image Preview */}
            {value && (
                <Card className="overflow-hidden">
                    <CardContent className="p-3">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium">Image Preview</span>
                                    {uploadService.isS3Url(value) && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            S3
                                        </span>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveImage}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="relative">
                                <img
                                    src={value}
                                    alt="Question preview"
                                    className="max-w-full h-auto max-h-48 rounded border object-contain"
                                    onLoad={(e) => {
                                        // Hide error message if image loads successfully
                                        const errorDiv = e.target.nextSibling;
                                        if (errorDiv) {
                                            errorDiv.style.display = 'none';
                                        }
                                        e.target.style.display = 'block';
                                    }}
                                    onError={(e) => {
                                        console.error('Image load error for URL:', value);
                                        e.target.style.display = 'none';
                                        const errorDiv = e.target.nextSibling;
                                        if (errorDiv) {
                                            errorDiv.style.display = 'block';
                                        }
                                    }}
                                    crossOrigin="anonymous"
                                />
                                <div
                                    className="text-sm text-red-500 p-3 bg-red-50 rounded border border-red-200"
                                    style={{ display: 'none' }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span>⚠️ Failed to load image</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // Retry loading the image
                                                const img = document.querySelector(`img[src="${value}"]`);
                                                if (img) {
                                                    img.src = img.src + '?retry=' + Date.now();
                                                }
                                            }}
                                            className="text-xs h-6 px-2"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                    <div className="text-xs">
                                        This might be a temporary network issue. Try refreshing the page or clicking retry.
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground break-all">
                                <strong>File:</strong> {uploadService.getFilenameFromUrl(value)}
                                <br />
                                <strong>URL:</strong> {value}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
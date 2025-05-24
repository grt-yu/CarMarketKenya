import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, X, Plus, AlertCircle, Car, DollarSign, 
  MapPin, Settings, Info, Camera 
} from "lucide-react";
import { insertCarSchema, type InsertCar } from "@shared/schema";
import { 
  CAR_MAKES, BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, 
  CONDITIONS, KENYAN_COUNTIES, formatPrice 
} from "@/lib/constants";
import { z } from "zod";

const carFormSchema = insertCarSchema.extend({
  images: z.array(z.string()).min(1, "At least one image is required").max(10, "Maximum 10 images allowed"),
  features: z.array(z.string()).default([]),
  price: z.string().min(1, "Price is required").regex(/^\d+$/, "Price must be a valid number"),
  mileage: z.string().min(1, "Mileage is required").regex(/^\d+$/, "Mileage must be a valid number"),
  year: z.string().min(1, "Year is required").regex(/^\d{4}$/, "Year must be a 4-digit number"),
});

type CarFormData = z.infer<typeof carFormSchema>;

interface CarFormProps {
  onSubmit: (data: InsertCar) => void;
  isLoading?: boolean;
  initialData?: Partial<InsertCar>;
  onDataChange?: (data: Partial<InsertCar>) => void;
}

const COMMON_FEATURES = [
  "Air Conditioning", "Power Steering", "Electric Windows", "Central Locking",
  "ABS Brakes", "Airbags", "Alloy Wheels", "Leather Seats", "Sunroof",
  "Navigation System", "Bluetooth", "Backup Camera", "Parking Sensors",
  "Cruise Control", "Heated Seats", "Premium Sound System", "Keyless Entry"
];

export default function CarForm({ onSubmit, isLoading = false, initialData, onDataChange }: CarFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initialData?.features || []);
  const [customFeature, setCustomFeature] = useState("");

  const form = useForm<CarFormData>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      sellerId: 1, // Mock seller ID - in real app this would come from auth context
      title: initialData?.title || "",
      make: initialData?.make || "",
      model: initialData?.model || "",
      year: initialData?.year?.toString() || "",
      price: initialData?.price || "",
      mileage: initialData?.mileage?.toString() || "",
      fuelType: initialData?.fuelType || "",
      transmission: initialData?.transmission || "",
      bodyType: initialData?.bodyType || "",
      color: initialData?.color || "",
      condition: initialData?.condition || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      county: initialData?.county || "",
      images: imageUrls,
      features: selectedFeatures,
      isAvailable: initialData?.isAvailable ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      isPremium: initialData?.isPremium ?? false,
    },
    mode: "onChange",
  });

  const watchedValues = form.watch();

  // Notify parent of data changes
  React.useEffect(() => {
    if (onDataChange) {
      const formData = form.getValues();
      onDataChange({
        ...formData,
        year: parseInt(formData.year) || undefined,
        price: formData.price,
        mileage: parseInt(formData.mileage) || undefined,
        images: imageUrls,
        features: selectedFeatures,
      });
    }
  }, [watchedValues, imageUrls, selectedFeatures, onDataChange]);

  const handleSubmit = (data: CarFormData) => {
    const submitData: InsertCar = {
      ...data,
      year: parseInt(data.year),
      mileage: parseInt(data.mileage),
      images: imageUrls,
      features: selectedFeatures,
    };
    onSubmit(submitData);
  };

  const addImageUrl = () => {
    if (newImageUrl && imageUrls.length < 10) {
      const updatedImages = [...imageUrls, newImageUrl];
      setImageUrls(updatedImages);
      form.setValue("images", updatedImages);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedImages);
    form.setValue("images", updatedImages);
  };

  const toggleFeature = (feature: string) => {
    const updated = selectedFeatures.includes(feature)
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature];
    setSelectedFeatures(updated);
    form.setValue("features", updated);
  };

  const addCustomFeature = () => {
    if (customFeature && !selectedFeatures.includes(customFeature)) {
      const updated = [...selectedFeatures, customFeature];
      setSelectedFeatures(updated);
      form.setValue("features", updated);
      setCustomFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    const updated = selectedFeatures.filter(f => f !== feature);
    setSelectedFeatures(updated);
    form.setValue("features", updated);
  };

  // Generate title automatically
  const generateTitle = () => {
    const make = form.getValues("make");
    const model = form.getValues("model");
    const year = form.getValues("year");
    
    if (make && model && year) {
      const title = `${year} ${make} ${model}`;
      form.setValue("title", title);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make *</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      generateTitle();
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CAR_MAKES.map((make) => (
                          <SelectItem key={make} value={make}>{make}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Corolla" 
                        {...field} 
                        onBlur={() => {
                          field.onBlur();
                          generateTitle();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={new Date().getFullYear().toString()}
                        min="1990" 
                        max={new Date().getFullYear()}
                        {...field} 
                        onBlur={() => {
                          field.onBlur();
                          generateTitle();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2019 Toyota Corolla" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be the main heading for your listing
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bodyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BODY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Black, White, Silver" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FUEL_TYPES.map((fuel) => (
                          <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmission *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRANSMISSIONS.map((trans) => (
                          <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONDITIONS.map((condition) => (
                          <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mileage (km) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 50000" 
                      min="0"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the current mileage in kilometers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (KES) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                        KSh
                      </span>
                      <Input 
                        type="number" 
                        placeholder="1500000" 
                        min="0"
                        step="1000"
                        className="pl-12"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    {field.value && !isNaN(parseInt(field.value)) && (
                      <span className="text-primary font-medium">
                        {formatPrice(parseInt(field.value))}
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Pricing Tips:</strong> Research similar cars in your area to set a competitive price. 
                Consider the car's condition, mileage, and market demand.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>County *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select county" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KENYAN_COUNTIES.map((county) => (
                          <SelectItem key={county} value={county}>{county}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Westlands, Nairobi" {...field} />
                    </FormControl>
                    <FormDescription>
                      Include area/estate for better visibility
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Images ({imageUrls.length}/10)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Images */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Car image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200";
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {index === 0 && (
                      <Badge className="absolute bottom-2 left-2 text-xs">
                        Main
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Image */}
            {imageUrls.length < 10 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                  />
                  <Button 
                    type="button" 
                    onClick={addImageUrl}
                    disabled={!newImageUrl}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                <Alert>
                  <Upload className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Image Tips:</strong> Use high-quality images showing exterior, interior, and engine. 
                    The first image will be used as the main photo. You can use image hosting services like 
                    Imgur, Cloudinary, or direct URLs.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {form.formState.errors.images && (
              <p className="text-sm text-destructive">{form.formState.errors.images.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features & Equipment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Features */}
            {selectedFeatures.length > 0 && (
              <div>
                <label className="text-sm font-medium">Selected Features:</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedFeatures.map((feature) => (
                    <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeFeature(feature)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Common Features */}
            <div>
              <label className="text-sm font-medium mb-3 block">Common Features:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {COMMON_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={selectedFeatures.includes(feature)}
                      onCheckedChange={() => toggleFeature(feature)}
                    />
                    <label
                      htmlFor={feature}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Feature */}
            <div>
              <label className="text-sm font-medium mb-2 block">Add Custom Feature:</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter custom feature"
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addCustomFeature}
                  disabled={!customFeature}
                >
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your car's condition, service history, any modifications, reason for selling, etc."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information to attract serious buyers. 
                    Mention service history, any issues, recent repairs, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Listing Options */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Available for Sale
                    </FormLabel>
                    <FormDescription>
                      Make this listing visible to buyers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Errors */}
        {Object.keys(form.formState.errors).length > 0 && (
          <Alert className="border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors above before submitting your listing.
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Creating Listing..." : "Create Listing"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={() => form.reset()}
          >
            Reset Form
          </Button>
        </div>
      </form>
    </Form>
  );
}

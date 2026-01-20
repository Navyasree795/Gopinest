import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, MapPin, IndianRupee, Users, Image, FileText, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
];

const roomTypes = ["Single Room", "Shared Room", "1 BHK", "2 BHK", "Studio", "PG"];

const tenantTypes = ["Student", "Working Professional", "Family", "Any"];

const amenitiesList = [
  "WiFi",
  "AC",
  "Furnished",
  "Parking",
  "Power Backup",
  "Water Supply",
  "Meals",
  "Laundry",
  "Gym",
  "Security",
];

const AddRoom = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    city: "",
    location: "",
    roomType: "",
    rent: "",
    deposit: "",
    tenantType: "",
    description: "",
    amenities: [] as string[],
  });

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Room Listed Successfully!",
      description: "Your room will be visible after admin approval.",
    });

    setIsSubmitting(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen gradient-hero pb-8">
      <PageHeader backTo="/dashboard" title="Add Room" />

      <main className="container px-4 py-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="bg-card rounded-2xl card-shadow p-6 space-y-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <Home className="text-primary-foreground" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Room Details
              </h2>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Room Title</Label>
              <Input
                id="title"
                placeholder="e.g., Spacious 1BHK in Andheri"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="h-12"
              />
            </div>

            {/* City & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  City
                </Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {cities.map((city) => (
                      <SelectItem key={city} value={city.toLowerCase()}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select
                  value={formData.roomType}
                  onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Locality / Area</Label>
              <Input
                placeholder="e.g., Andheri West"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="h-12"
              />
            </div>

            {/* Rent & Deposit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <IndianRupee size={14} className="text-primary" />
                  Monthly Rent
                </Label>
                <Input
                  type="number"
                  placeholder="15000"
                  value={formData.rent}
                  onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <IndianRupee size={14} className="text-primary" />
                  Deposit
                </Label>
                <Input
                  type="number"
                  placeholder="30000"
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
            </div>

            {/* Tenant Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users size={14} className="text-primary" />
                Preferred Tenant
              </Label>
              <Select
                value={formData.tenantType}
                onValueChange={(value) => setFormData({ ...formData, tenantType: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select tenant type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {tenantTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText size={14} className="text-primary" />
                Description
              </Label>
              <Textarea
                placeholder="Describe your room, locality, nearby facilities..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 gap-3">
                {amenitiesList.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <label
                      htmlFor={amenity}
                      className="text-sm cursor-pointer text-foreground"
                    >
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Upload Placeholder */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Image size={14} className="text-primary" />
                Room Images
              </Label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Image className="mx-auto text-muted-foreground mb-3" size={40} />
                <p className="text-sm text-muted-foreground">
                  Tap to upload room images
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (Feature coming soon)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold btn-shadow"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <PlusCircle className="mr-2" size={20} />
                  List My Room
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddRoom;

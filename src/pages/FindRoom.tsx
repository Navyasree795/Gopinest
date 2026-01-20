import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, IndianRupee, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PageHeader from "@/components/PageHeader";

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
];

const FindRoom = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState([5000, 25000]);
  const [tenantType, setTenantType] = useState("any");

  const handleSearch = () => {
    const params = new URLSearchParams({
      city,
      location,
      minBudget: budget[0].toString(),
      maxBudget: budget[1].toString(),
      tenantType,
    });
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="min-h-screen gradient-hero">
      <PageHeader backTo="/dashboard" title="Find Room" />

      <main className="container px-4 py-8 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl card-shadow p-6 animate-slide-up">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Search className="text-primary" size={22} />
            Search Filters
          </h2>

          <div className="space-y-6">
            {/* City Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                City
              </Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {cities.map((c) => (
                    <SelectItem key={c} value={c.toLowerCase()}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Locality / Area
              </Label>
              <Input
                placeholder="e.g., Andheri West, Koramangala"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Budget Slider */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <IndianRupee size={16} className="text-primary" />
                Budget Range
              </Label>
              <Slider
                value={budget}
                onValueChange={setBudget}
                min={1000}
                max={50000}
                step={1000}
                className="py-4"
              />
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">
                  ₹{budget[0].toLocaleString()}
                </span>
                <span className="text-muted-foreground">to</span>
                <span className="font-medium text-foreground">
                  ₹{budget[1].toLocaleString()}
                </span>
              </div>
            </div>

            {/* Tenant Type */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                Tenant Type
              </Label>
              <RadioGroup
                value={tenantType}
                onValueChange={setTenantType}
                className="flex flex-wrap gap-3"
              >
                {[
                  { value: "any", label: "Any" },
                  { value: "student", label: "Student" },
                  { value: "working", label: "Working Professional" },
                  { value: "family", label: "Family" },
                ].map((type) => (
                  <div key={type.value} className="flex items-center">
                    <RadioGroupItem
                      value={type.value}
                      id={type.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type.value}
                      className="px-4 py-2 rounded-full border-2 border-border cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary hover:border-primary/50"
                    >
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="w-full h-14 text-lg font-semibold btn-shadow mt-4"
            >
              <Search className="mr-2" size={20} />
              Search Rooms
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindRoom;

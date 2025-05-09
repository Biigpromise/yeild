
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormStepOneProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  companySize: string;
  setCompanySize: (value: string) => void;
}

const FormStepOne = ({
  companyName,
  setCompanyName,
  email,
  setEmail,
  password,
  setPassword,
  website,
  setWebsite,
  companySize,
  setCompanySize
}: FormStepOneProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name*</Label>
        <Input
          id="companyName"
          placeholder="Enter your company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="yeild-input"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Business Email*</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your business email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="yeild-input"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Create Password*</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="yeild-input"
          minLength={8}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">Company Website*</Label>
          <Input
            id="website"
            placeholder="https://"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="yeild-input"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size*</Label>
          <Select value={companySize} onValueChange={setCompanySize}>
            <SelectTrigger className="yeild-input">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="500+">500+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default FormStepOne;

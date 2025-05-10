
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

type SettingsFormValues = {
  siteName: string;
  siteDescription: string;
  allowPublicRegistration: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
};

export const AdminSettings = () => {
  const form = useForm<SettingsFormValues>({
    defaultValues: {
      siteName: "Yeild",
      siteDescription: "Task marketplace connecting brands with audience",
      allowPublicRegistration: true,
      maintenanceMode: false,
      emailNotifications: true,
    },
  });

  const onSubmit = (data: SettingsFormValues) => {
    console.log("Settings updated:", data);
    toast({
      title: "Success",
      description: "Settings updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Platform Settings</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-4">
              <h4 className="text-md font-medium mb-4">General Settings</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Brief description of your platform
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-md font-medium mb-4">Configuration</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="allowPublicRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Public Registration</FormLabel>
                        <FormDescription>
                          Allow new users to register
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maintenanceMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Maintenance Mode</FormLabel>
                        <FormDescription>
                          Put the site in maintenance mode
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Email Notifications</FormLabel>
                        <FormDescription>
                          Send email notifications to users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <div className="flex justify-end">
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

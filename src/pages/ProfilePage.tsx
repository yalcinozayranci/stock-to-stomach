import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HomeHeader } from '@/components/home/HomeHeader';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { DietarySelector } from '@/components/profile/DietarySelector';
import { AllergySelector } from '@/components/profile/AllergySelector';
import { CuisineSelector } from '@/components/profile/CuisineSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DietaryPreference, FoodAllergy, CuisineType } from '@/types/database';
import { Loader2, Save, User, AlertTriangle, Heart, ChefHat, Camera, Upload } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  
  const [displayName, setDisplayName] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  const [allergies, setAllergies] = useState<FoodAllergy[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<CuisineType[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setDietaryPreferences(profile.dietary_preferences || []);
      setAllergies(profile.allergies || []);
      setFavoriteCuisines(profile.favorite_cuisines || []);
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      await updateProfile.mutateAsync({
        avatar_url: `${publicUrl}?t=${Date.now()}`, // Cache bust
      });

      toast.success('Profile photo updated!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload photo');
      setAvatarPreview(profile?.avatar_url || null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        dietary_preferences: dietaryPreferences,
        allergies: allergies,
        favorite_cuisines: favoriteCuisines,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  const initials = displayName.slice(0, 2).toUpperCase() || 'U';

  return (
    <Layout showBottomNav>
      <div className="container max-w-2xl mx-auto px-4 pt-4 pb-28">
        <HomeHeader />
        
        <h2 className="font-display text-2xl font-bold mt-6 mb-2">Profile Settings</h2>
        <p className="text-muted-foreground mb-6">
          Customize your experience and keep your food preferences up to date
        </p>

        <div className="space-y-6">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Profile Photo</CardTitle>
              </div>
              <CardDescription>Upload a photo to personalize your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={avatarPreview || undefined} alt={displayName} />
                    <AvatarFallback className="bg-gradient-warm text-primary-foreground text-2xl font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled className="mt-1 bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dietary Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Dietary Preferences</CardTitle>
              </div>
              <CardDescription>Select any diets you follow</CardDescription>
            </CardHeader>
            <CardContent>
              <DietarySelector selected={dietaryPreferences} onChange={setDietaryPreferences} />
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <CardTitle className="text-lg">Food Allergies</CardTitle>
              </div>
              <CardDescription>
                Select your allergies so we can warn you about recipes containing these ingredients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AllergySelector selected={allergies} onChange={setAllergies} />
            </CardContent>
          </Card>

          {/* Favorite Cuisines */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Favorite Cuisines</CardTitle>
              </div>
              <CardDescription>Choose your preferred cuisines for personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <CuisineSelector selected={favoriteCuisines} onChange={setFavoriteCuisines} />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding, logout } from "../lib/api";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon, CameraIcon } from "lucide-react";
import { LANGUAGES } from "../constants";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
    phone: "",
    countryCode: "+1",
    interests: authUser?.interests || "",
    language: authUser?.language || "",
    city: "",
    country: "",
    profilePic: authUser?.profilePic || "",
  });

  // Country calling code options
  const [countryOptions, setCountryOptions] = useState([]);
  const [isCodesLoading, setIsCodesLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCodes = async () => {
      try {
        setIsCodesLoading(true);
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags,flag");
        const raw = await res.json();
        const mapped = raw
          .map((c) => {
            const root = c?.idd?.root || "";
            const suffixes = c?.idd?.suffixes || [];
            const firstSuffix = suffixes[0] || "";
            const dial = `${root}${firstSuffix}`;
            if (!dial) return null;
            return {
              name: c?.name?.common || "Unknown",
              code: c?.cca2 || "",
              dialCode: dial,
              flagEmoji: c?.flag || "",
              flagPng: c?.flags?.png || "",
              flagSvg: c?.flags?.svg || "",
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(b.name));
        if (isMounted) setCountryOptions(mapped);
      } catch (e) {
        // ignore, fallback will be used
      } finally {
        if (isMounted) setIsCodesLoading(false);
      }
    };
    fetchCodes();
    // Preselect country code based on IP geolocation
    const fetchGeo = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const geo = await res.json();
        const dial = geo?.country_calling_code; // e.g. "+1"
        const countryName = geo?.country_name;
        if (dial) {
          // Set both code and country if available and not already set by user
          setFormState((prev) => ({
            ...prev,
            countryCode: prev.countryCode || dial,
            country: prev.country || countryName || prev.country,
          }));
        }
      } catch (_) {
        // ignore
      }
    };
    fetchGeo();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCountry = countryOptions.find((c) => c.dialCode === formState.countryCode);

  // Prefill from navigation state (values passed after signup)
  useEffect(() => {
    const passed = location.state || {};
    setFormState((prev) => ({
      ...prev,
      fullName: passed.fullName ?? prev.fullName,
      email: passed.email ?? prev.email,
    }));
  }, [location.state]);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: async () => {
      toast.success("Profile onboarded successfully");
      // Ensure cache has the latest profile fields so landing can show name/avatar
      queryClient.setQueryData(["authUser"], {
        success: true,
        user: {
          ...(authUser || {}),
          isOnboarded: true,
          fullName: formState.fullName || authUser?.fullName || "",
          email: formState.email || authUser?.email || "",
          profilePic: formState.profilePic || authUser?.profilePic || "",
          location: [formState.city, formState.country].filter(Boolean).join(", "),
          language: formState.language || authUser?.language || "",
          interests: formState.interests || authUser?.interests || "",
        },
      });
      // Prevent any immediate refetch from clobbering the cache before navigation settles
      await new Promise((r) => setTimeout(r, 100));
      navigate("/landing", { replace: true });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      fullName: formState.fullName,
      interests: formState.interests,
      language: formState.language,
      location: [formState.city, formState.country].filter(Boolean).join(", "),
      profilePic: formState.profilePic,
      email: formState.email,
      phone: formState.phone ? `${formState.countryCode} ${formState.phone}` : undefined,
    };
    if (!dataToSend.profilePic) delete dataToSend.profilePic;
    // Optimistic navigation for immediate UX
    navigate("/landing");
    // Also update cache optimistically so landing has info instantly
    queryClient.setQueryData(["authUser"], {
      success: true,
      user: {
        ...(authUser || {}),
        isOnboarded: true,
        fullName: dataToSend.fullName,
        email: dataToSend.email,
        profilePic: dataToSend.profilePic,
        location: dataToSend.location,
        language: dataToSend.language,
        interests: dataToSend.interests,
      },
    });
    onboardingMutation(dataToSend);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4" data-theme="retro">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Complete Your Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>

              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>

            {/* EMAIL */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="input input-bordered w-full"
                placeholder="you@example.com"
              />
            </div>

            {/* PHONE WITH CODE */}
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-3 items-end">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Country Code</span>
                </label>
                {selectedCountry ? (
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={selectedCountry.flagPng || selectedCountry.flagSvg}
                      alt={selectedCountry.name}
                      className="w-6 h-4 object-cover rounded border border-base-300"
                    />
                    <span className="text-sm opacity-80">{selectedCountry.name}</span>
                  </div>
                ) : null}
                <select
                  className="select select-bordered"
                  value={formState.countryCode}
                  onChange={(e) => setFormState({ ...formState, countryCode: e.target.value })}
                >
                  {/* default fallback in case fetch isn't ready */}
                  <option value="+1">+1 United States</option>
                  {!isCodesLoading &&
                    countryOptions.map((opt) => (
                      <option key={`${opt.code}-${opt.dialCode}`} value={opt.dialCode}>
                        {opt.dialCode} {opt.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone Number</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered w-full"
                  placeholder="1234567890"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Interests*/}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Interests</span>
              </label>
              <textarea
                name="interests"
                value={formState.interests}
                onChange={(e) => setFormState({ ...formState, interests: e.target.value })}
                className="textarea textarea-bordered h-24"
                placeholder="Tell us about your interests"
              />
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.language}
                  onChange={(e) => setFormState({ ...formState, language: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Select your language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* CITY + COUNTRY on one line */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">City</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                    <input
                      type="text"
                      value={formState.city}
                      onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                      onBlur={async () => {
                        if (!formState.city) return;
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&city=${encodeURIComponent(formState.city)}`);
                          const data = await res.json();
                          const country = data?.[0]?.address?.country || "";
                          setFormState((prev) => ({ ...prev, country }));
                        } catch (_) {}
                      }}
                      className="input input-bordered w-full pl-10"
                      placeholder="City"
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Country</span>
                  </label>
                  <input
                    type="text"
                    value={formState.country}
                    onChange={(e) => setFormState({ ...formState, country: e.target.value })}
                    className="input input-bordered w-full"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}

            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <img
                    src="/icon1.png"
                    alt="Craft Icon"
                    className="w-7 h-7 rounded-lg"
                  />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;


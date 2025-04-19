import {SearchIcon} from "lucide-react";
import AuthForm from "../components/auth_form.tsx";
import {Input} from "@heroui/react";
import AuthFormCarousel from "../components/auth_form_carousel.tsx";

function Auth() {
    return (
        <div className={"grid grid-cols-3 gap-4 h-screen overflow-hidden bg-[url('public/light-bg.png')]  dark:bg-[url('public/dark-bg.png')] bg-no-repeat bg-cover"}>
            <div className="col-span-1 shadow-sm rounded-none h-full w-full border-none
    bg-background/60 dark:bg-default-100/50 flex items-center justify-center
    backdrop-blur-md">
                <AuthForm/>
            </div>

            <div className="col-span-2">
                {/* Search Bar To Explore The News */}
                <div className="flex items-center justify-center h-[30px] m-2">
                    <Input
                        isClearable
                        classNames={{
                            label: "text-black/50 dark:text-white/90",
                            input: [
                                "bg-transparent",
                                "text-black/90 dark:text-white/90",
                                "placeholder:text-default-700 dark:placeholder:text-white/60",
                                // Center the placeholder text
                                "text-center",
                            ],
                            innerWrapper: "bg-transparent",
                            inputWrapper: [
                                "shadow-md",
                                "bg-default-200/50",
                                "dark:bg-default/60",
                                "backdrop-blur-xl",
                                "backdrop-saturate-200",
                                "hover:bg-default-200/70",
                                "dark:hover:bg-default/70",
                                "group-data-[focus=true]:bg-default-200/50",
                                "dark:group-data-[focus=true]:bg-default/60",
                                "!cursor-text",
                            ],
                        }}
                        placeholder="Explore"
                        radius="lg"
                        startContent={
                            // Center the icon
                            <SearchIcon
                                className="mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0"/>
                        }
                    />
                </div>

                <AuthFormCarousel/>
            </div>
        </div>
    );
}

export default Auth;

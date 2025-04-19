import React from "react";
import {Tabs, Tab, Input, Link, Button, Card, CardBody} from "@heroui/react";

export default function AuthForm (){
    const [selected, setSelected] = React.useState<any>("login");

    return(
        <div className="flex items-center justify-center w-full h-full">
            <Card className="max-w-full w-[340px] h-[500px] bg-transparent" shadow={"none"}>
                <CardBody className="overflow-hidden">
                    <Tabs
                        fullWidth
                        aria-label="Tabs form"
                        selectedKey={
                            selected
                        }
                        size="lg"
                        onSelectionChange={setSelected}
                    >
                        <Tab key="login" title="Login">
                            <Button isIconOnly aria-label="Google" color="warning" variant="faded" className={"mx-2"}>
                                <img src={"./public/icons/google.png"} alt="Google" className={"p-2"}/>
                            </Button>

                            <Button isIconOnly aria-label="Microsoft" color="warning" variant="faded" className={"mx-2"}>
                                <img src={"./public/icons/microsoft.png"} alt="Microsoft" className={"p-2"}/>
                            </Button>
                                <p className="text-center">or</p>
                                <form className="flex flex-col gap-4">
                                    <Input isRequired label="Email" placeholder="Enter your email" type="email" />
                                    <Input isRequired label="Password" placeholder="Enter your password" type="password" />
                                    <p className="text-center text-small">
                                        Need to create an account?{" "}
                                        <Link size="sm" onPress={() => setSelected("sign-up")}>
                                            Sign up
                                        </Link>
                                    </p>
                                    <Button fullWidth color="primary">Login</Button>
                                </form>
                        </Tab>
                        <Tab key="sign-up" title="Sign up">
                            <Button isIconOnly aria-label="Google" color="warning" variant="faded" className={"mx-2"}>
                                <img src={"./public/icons/google.png"} alt="Google" className={"p-2"}/>
                            </Button>

                            <Button isIconOnly aria-label="Microsoft" color="warning" variant="faded" className={"mx-2"}>
                                <img src={"./public/icons/microsoft.png"} alt="Microsoft" className={"p-2"}/>
                            </Button>
                            <p className="text-center">or</p>
                            <form className="flex flex-col gap-4 h-[300px]">
                                <Input isRequired label="Name" placeholder="Enter your name" type="password" />
                                <Input isRequired label="Email" placeholder="Enter your email" type="email" />
                                <Input
                                    isRequired
                                    label="Password"
                                    placeholder="Enter your password"
                                    type="password"
                                />

                                <p className="text-center text-small">
                                    Already have an account?{" "}
                                    <Link size="sm" onPress={() => setSelected("login")}>
                                        Login
                                    </Link>
                                </p>

                                <div className="flex gap-2 justify-end">
                                    <Button fullWidth color="primary">
                                        Sign up
                                    </Button>
                                </div>
                                <p className="text-center text-small">
                                    By Clicking Sign Up, You're agreeing to the{" "}
                                    <Link size="sm" onPress={() => setSelected("login")}>
                                        Terms and Conditions
                                    </Link>
                                </p>

                            </form>
                        </Tab>
                    </Tabs>
                </CardBody>
            </Card>
        </div>
    )
}
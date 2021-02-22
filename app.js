const request = require("request");
const fs = require("fs");
const figlet = require("figlet");
const fetch = require("node-fetch");
const lineReader = require('line-reader');
const proxies = __dirname + "/proxies.txt";
require("colors");
var term = require("terminal-kit").terminal;
var proxyLine = 0;
var proxyUrl = "";
var working = [];
var version = "v1.3.2"
var toMatch;
// highest rate possible before the stress errors will start to occur
const triesPerSecond = 1;

console.clear();
console.log(figlet.textSync("Nitro Gen").green);
console.log(figlet.textSync(version).blue);
console.log(figlet.textSync("By: Tear").red);


generatecode = function() {
    let code = "";
    let dict = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (var i = 0; i < 16; i++) {
        code = code + dict.charAt(Math.floor(Math.random() * dict.length));
    }
    return code;
};
// async for fetch
async function updateLine() {
    proxyLine++;
    var readLine = 0;
    lineReader.eachLine(proxies, function(line, last) {
        readLine++;
        if (readLine === proxyLine) {
            proxyUrl = "http://" + line;
        }
        if (last) {
            // scrape proxies if none are detected
            readLine = 0;
            if (proxyUrl === `http://${line}`) {

                (async() => {
                    term.cyan("No proxies detected now scrapping...\n");
                    await fetch("https://api.proxyscrape.com/?request=displayproxies&proxytype=http&timeout=7000&country=all&anonymity=all&ssl=yes").then(async res => {
                        const body = (await res.text());
                        fs.writeFileSync(__dirname + "/proxies.txt", body);
                    });
                })();
                proxyLine = 0
            }
        }
    });
}

updateLine();
// requests api checks in order using proxies instead of all at the same time 
// because it would be the exact same waiting time plus more stress with many requests at the same time possibly causing an error
// also changed body requests to no longer parse body data and just use status codes instead
checkCode = function(code) {
    var proxiedRequest = request.defaults({
        'proxy': proxyUrl
    });
    proxiedRequest.timeout = 1500;
    proxiedRequest.get(`https://discordapp.com/api/v6/entitlements/gift-codes/${code}?with_application=false&with_subscription_plan=true`, (error, resp, body) => {
        if (error) {
            term.brightYellow("Invalid proxy switching now...\n");
            updateLine();
            return;
        }
        try {
            if (body.code == 200) {
                term.brightGreen(`This code should work unless an error is posted below! https://discord.gift/${code}\n`);
                console.log(JSON.stringify(body, null, 4));
                working.push(`https://discord.gift/${code}`);
                fs.writeFileSync(__dirname + '/codes.json', JSON.stringify(working, null, 4));
                if (toMatch === 0) {
                    process.exit();
                } else {
                    //console.log("test")
                }
            } else if (body.code == 429) {
                updateLine();
                term.brightYellow("Your being rate limited! switching...\n");

            } else {
                term.brightRed(`discord.com/gifts/${code} is an invalid code!\n`);
            }
        } catch (error) {
            term.gray("An error occurred:\n");
            term.gray(error + "\n");
            return;
        }
    });
}
checkCodeOffline = function(code) {
    request(`https://discordapp.com/api/v6/entitlements/gift-codes/${code}?with_application=false&with_subscription_plan=true`, (error, res, body) => {
        if (error) {
            term.gray("An error occurred:\n");
            term.gray(error + "\n");
            return;
        }
        try {
            if (body.code == 200) {
                term.brightGreen(`This code should work unless an error is posted below! https://discord.gift/${code}\n`);
                console.log(JSON.stringify(body, null, 4));
                working.push(`https://discord.gift/${code}`);
                fs.writeFileSync(__dirname + '/codes.json', JSON.stringify(working, null, 4));
                if (toMatch === 0) {
                    process.exit();
                } else {
                    //console.log("test")
                }
            } else if (body.code == 429) {
                term.brightYellow("You are being rate limited!");
            } else {
                term.brightRed(`discord.com/gifts/${code} is an invalid code!\n`);

            }
        } catch (error) {
            term.gray("An error occurred:\n");
            term.gray(error + "\n");
            return;
        }
    });
}


function main() {
    term.brightYellow(
        "Would you like to run Tear's nitro generator? [Y|N]\n"
    );

    term.yesOrNo({
        yes: ["y", "ENTER"],
        no: ["n"]
    }, function(error, result) {


        if (result) {


            term.brightYellow(
                "Would you like you to enable autostop? [Y|N]\n"
            );

            term.yesOrNo({
                yes: ["y", "ENTER"],
                no: ["n"]
            }, function(error, result) {
                if (result) {
                    toMatch = 0;

                    term.brightYellow(
                        "Would you like you to enable the use of proxy's? [Y|N]\n"
                    );

                    term.yesOrNo({
                        yes: ["y", "ENTER"],
                        no: ["n"]
                    }, function(error, result) {
                        if (result) {



                            term.cyan("Now using proxies...\n");

                            var progressBar, progress = 0;


                            function doProgress() {

                                // Add random progress
                                progress += Math.random() / 10;
                                progressBar.update(progress);

                                if (progress >= 1) {

                                    console.clear();
                                    setTimeout(function() {
                                        term.cyan("Now using proxies...\n");
                                        term.green("-------------------------------------\n");
                                        term.brightCyan("Made by: tear#9999\n");
                                    }, 2000);
                                    setTimeout(function() {
                                        term.brightCyan(
                                            "If you payed for this generator you got scammed lmao\n"
                                        );
                                    }, 4000);
                                    setTimeout(function() {
                                        term.brightCyan(
                                            "Takes a really long time to find a working code\n"
                                        );
                                    }, 6000);
                                    setTimeout(function() {
                                        term.brightCyan("Press 'N' to stop the generator at any time\n");
                                    }, 8000);
                                    setTimeout(function() {
                                        term.brightCyan("Enjoy :)\n");
                                    }, 10000);

                                    term.green("-------------------------------------\n");
                                    term.green(`Discord nitro giftcard generater ${version} \n`);
                                    term.green(`Checking a code every ${1 / triesPerSecond} second(s)\n`);

                                    setTimeout(function() {

                                        setInterval(() => {
                                            checkCode(generatecode());
                                        }, (1 / triesPerSecond) * 250);
                                    }, 12000);

                                } else {
                                    setTimeout(doProgress, 100 + Math.random() * 400);
                                }
                            }


                            progressBar = term.progressBar({
                                width: 80,
                                title: "Starting generator....",
                                eta: true,
                                percent: true
                            });

                            doProgress();



                        } else {
                            term.red("'No' detected, not using proxies...\n");


                            var progressBar, progress = 0;


                            function doProgress() {

                                // Add random progress
                                progress += Math.random() / 10;
                                progressBar.update(progress);

                                if (progress >= 1) {

                                    console.clear();
                                    setTimeout(function() {

                                        term.green("-------------------------------------\n");
                                        term.brightCyan("Made by: tear#9999\n");
                                    }, 2000);
                                    setTimeout(function() {
                                        term.brightCyan(
                                            "If you payed for this generator you got scammed lmao\n"
                                        );
                                    }, 4000);
                                    setTimeout(function() {
                                        term.brightCyan(
                                            "Takes a really long time to find a working code\n"
                                        );
                                    }, 6000);
                                    setTimeout(function() {
                                        term.brightCyan("Press 'N' to stop the generator at any time\n");
                                    }, 8000);
                                    setTimeout(function() {
                                        term.brightCyan("Enjoy :)\n");
                                    }, 10000);

                                    term.green("-------------------------------------\n");
                                    term.green(`Discord nitro giftcard generater ${version} \n`);
                                    term.green(`Checking a code every ${12 / triesPerSecond} second(s)\n`);

                                    setTimeout(function() {

                                        setInterval(() => {
                                            checkCodeOffline(generatecode());
                                        }, (12 / triesPerSecond) * 1000);
                                    }, 12000);

                                } else {
                                    setTimeout(doProgress, 100 + Math.random() * 400);
                                }
                            }


                            progressBar = term.progressBar({
                                width: 80,
                                title: "Starting generator....",
                                eta: true,
                                percent: true
                            });

                            doProgress();


                        }
                    });


                } else {
                    term.red("'No' generator will continually log codes until manually stopped...\n");

                    term.brightYellow(
                        "Would you like you to enable the use of proxy's? [Y|N]\n"
                    );

                    term.yesOrNo({
                        yes: ["y", "ENTER"],
                        no: ["n"]
                    }, function(error, result) {
                        if (result) {



                            term.cyan("Now using proxies...\n");

                            var progressBar, progress = 0;


                            function doProgress() {

                                // Add random progress
                                progress += Math.random() / 10;
                                progressBar.update(progress);

                                if (progress >= 1) {

                                    console.clear();
                                    setTimeout(function() {

                                        term.green("-------------------------------------\n");
                                        term.brightCyan("Made by: tear#9999\n");
                                    }, 2000);
                                    setTimeout(function() {
                                        term.brightCyan(
                                            "If you payed for this generator you got scammed lmao\n"
                                        );
                                    }, 4000);
                                    setTimeout(function() {
                                        term.brightCyan(
                                            "Takes a really long time to find a working code\n"
                                        );
                                    }, 6000);
                                    setTimeout(function() {
                                        term.brightCyan("Press 'N' to stop the generator at any time\n");
                                    }, 8000);
                                    setTimeout(function() {
                                        term.brightCyan("Enjoy :)\n");
                                    }, 10000);

                                    term.green("-------------------------------------\n");
                                    term.green(`Discord nitro giftcard generater ${version} \n`);
                                    term.green(`Checking a code every ${1 / triesPerSecond} second(s)\n`);

                                    setTimeout(function() {

                                        setInterval(() => {
                                            checkCode(generatecode());
                                        }, (1 / triesPerSecond) * 250);
                                    }, 12000);

                                } else {
                                    setTimeout(doProgress, 100 + Math.random() * 400);
                                }
                            }


                            progressBar = term.progressBar({
                                width: 80,
                                title: "Starting generator....",
                                eta: true,
                                percent: true
                            });

                            doProgress();



                        } else {
                            term.red("'No' detected, not using proxies...\n");


                            var progressBar, progress = 0;


                            function doProgress() {

                                // Add random progress
                                progress += Math.random() / 10;
                                progressBar.update(progress);

                                if (progress >= 1) {

                                    console.clear();
                                    setTimeout(function() {

                                        term.green("-------------------------------------\n");
                                        term.brightCyan("Made by: tear#9999\n");
                                    }, 2000);
                                    setTimeout(function() {
                                        term.brightCyan(
                                            "If you payed for this generator you got scammed lmao\n"
                                        );
                                    }, 4000);
                                    setTimeout(function() {
                                        term.brightCyan(
                                            "Takes a really long time to find a working code\n"
                                        );
                                    }, 6000);
                                    setTimeout(function() {
                                        term.brightCyan("Press 'N' to stop the generator at any time\n");
                                    }, 8000);
                                    setTimeout(function() {
                                        term.brightCyan("Enjoy :)\n");
                                    }, 10000);

                                    term.green("-------------------------------------\n");
                                    term.green(`Discord nitro giftcard generater ${version} \n`);
                                    term.green(`Checking a code every ${12 / triesPerSecond} second(s)\n`);

                                    setTimeout(function() {

                                        setInterval(() => {
                                            checkCodeOffline(generatecode());
                                        }, (12 / triesPerSecond) * 1000);
                                    }, 12000);

                                } else {
                                    setTimeout(doProgress, 100 + Math.random() * 400);
                                }
                            }


                            progressBar = term.progressBar({
                                width: 80,
                                title: "Starting generator....",
                                eta: true,
                                percent: true
                            });

                            doProgress();


                        }
                    });


                }
            });






        } else {
            term.red("'No' detected, now quitting generator...\n");
            process.exit();
        }
    });
}

main()
process.on('uncaughtException', function(err) {
    term.gray("An error occurred:\n");
    term.gray(err + "\n");
});


// made by tear
// https://github.com/therealtear

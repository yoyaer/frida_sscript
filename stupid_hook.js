
/*
argv1:log argvs
argv2:log return
argv3:log invoke stack
argv4:method express in jeb
*/
function hook(log_argv, log_ret, log_trace, methExpress) {
    if (methExpress == "") {
        return;
    }
    else {
        var retType = methExpress.split(":")[1];
        // methExpress = methExpress.replace("byte[]", "[B").replace("int[]", "[I").replace("short[]", "[S").replace("long[]", "[J").replace("float[]", "[F").replace("double[]", "[D").replace("char[]", "[C").replace("java.lang.String[]", "[Ljava.lang.String;");
        var argvs = methExpress.substring(methExpress.indexOf('(') + 1, methExpress.indexOf(')')).split(',');
        var frags = methExpress.substring(0, methExpress.indexOf('(')).split('.');
        var meth = frags.pop();
        var cla = frags.join('.');
    }

    var argvstrs1; //argvs[0].trim(),argvs[1].trim(),argvs[2].trim(),........
    if (argvs[0] == "") {
        argvstrs1 = ""

    } else {
        for (var i = 0; i < argvs.length; i++) {
            if (argvs[i].indexOf('[]') != -1) {
                argvs[i] = argvs[i].trim().replace('[]', ';').replace(/^/g, "[L");
            }
            argvs[i] = argvs[i].replace("byte[]", "[B").replace("int[]", "[I").replace("short[]", "[S").replace("long[]", "[J").replace("float[]", "[F").replace("double[]", "[D").replace("char[]", "[C");
            var argvstr = "argvs[" + i + "].trim()";
            if (i == 0) {
                argvstrs1 = argvstr;
            } else {
                argvstrs1 = argvstrs1 + "," + argvstr;
            }
        }
    }

    // console.log("methExpress:", methExpress);
    // console.log("cla:", cla);
    // console.log("meth:", meth);
    // console.log("argvs:", argvs);
    // console.log("argvstrs1:", argvstrs1);
    // console.log("retType:", retType);
    // return;
    Java.perform(function () {
        console.log("hook " + methExpress);
        var class1;
        try {
            class1 = Java.use(cla);
        } catch (error) {
            console.log("dynamicloader");
            Java.enumerateClassLoaders({
                onMatch: function (loader) {
                    try {
                        // console.log(loader);
                        if (loader.findClass(cla)) {
                            // console.log("bingo classloader:"+loader);
                            Java.classFactory.loader = loader;
                            class1 = Java.use(cla);
                        }
                    } catch (error) {
                        // console.log(error);
                        return;
                    }
                },
                onComplete: function () { }
            });
        }

        eval("class1." + meth + ".overload(" + argvstrs1 + ")").implementation = function () {
            console.log("--before " + methExpress.substring(0, methExpress.indexOf('(')));
            var len = arguments.length
            var argvstrs2; //arguments[0],arguments[1],arguments[2],.....
            if (arguments.length == 0) {
                argvstrs2 = "";
            } else {
                for (var i = 0; i < arguments.length; i++) {
                    if (log_argv) {
                        console.log("argv:", arguments[i]);
                    }
                    var argvstr = "arguments[" + i + "]";
                    if (i == 0) {
                        argvstrs2 = argvstr;
                    } else {
                        argvstrs2 = argvstrs2 + "," + argvstr;
                    }
                }
            }

            // console.log("argvstrs2:", argvstrs2);
            if (log_trace) {
                console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Throwable").$new()));
            }
            // var ret = this.a(argv1, argv2, argv3);
            // var ret = this.a(arguments[0],arguments[1],arguments[2]);	//有效
            var ret = eval("this." + meth + "(" + argvstrs2 + ")"); //work
            if (log_ret) {
                console.log("ret:" + ret);
            }
            console.log("--after " + methExpress.substring(0, methExpress.indexOf('(')));
            return ret;
        }
    });
}


function main() {
    console.log("---------js main!!!");
    hook(1, 1, 1, "com.tencent.mtt.SplashActivity.onCreate(android.os.Bundle) : void    ");
    hook(1, 1, 1, "");
    hook(1, 1, 1, "");
    hook(1, 1, 1, "");

}


setImmediate(main);
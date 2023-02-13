import { ethers } from "ethers";

interface ProjectConfig {
  studioConstructorData: {
    name: string;
    symbol: string;
    baseURI: string;
    scriptJSON: string;
    artistAddress: string;
    owner: string;
  };
  traitsConstructorData: {
    uri: string;
    owner: string;
    platformRevenueClaimer: string;
    artistRevenueClaimer: string;
  };
  createTraitsData: {
    traitTypeNames: string[];
    traitTypeValues: string[];
    traitNames: string[];
    traitValues: string[];
    traitTypeIndexes: number[];
    traitMaxRevenues: ethers.BigNumber[];
  };
  scheduleAuctionData: {
    auctionStartTime: number;
    auctionEndTime: number;
    auctionStartPrice: ethers.BigNumber;
    auctionEndPrice: ethers.BigNumber;
  };
  scripts: string[];
}

const projectConfigs: ProjectConfig[] = [
  {
    studioConstructorData: {
      name: "intrinsic.art Disentanglement",
      symbol: "INSC",
      baseURI: "https://api.intrinsic.art/",
      scriptJSON: `{
        "name": "Disentanglement",
        "description": "Informed by the experience of separating after a long marriage, (Dis)entanglement explores the endless ways that relationships intertwine. Each unique generative image represents one of many possible moments across the arc of a relationship, from a couple eagerly pulling taut their new connection, to a union defined solely by knots hardened over time. Whether connecting threads are carefully untied, crumbling from neglect, or snapping from tension, many couples can still safely go separate ways when needed. For some, there is no easy escape. Domestic violence, sexual abuse, financial hardship, and cultural norms can all keep someone bound to a partner against their will.",
        "artistName": "Phil Smith",
        "website": "https://disentanglement.com",
        "license": "MIT",
        "scriptLibrary": "p5.js",
        "scriptLibraryVersion": "1.0.0",
        "aspectRatio": "1"
      }`,
      artistAddress: "0xAa9D46AE079851116967c6573f961B304095C34a",
      owner: "0xAa9D46AE079851116967c6573f961B304095C34a",
    },
    traitsConstructorData: {
      uri: "https://api.intrinsic.art/",
      owner: "0xAa9D46AE079851116967c6573f961B304095C34a",
      platformRevenueClaimer: "0xAa9D46AE079851116967c6573f961B304095C34a",
      artistRevenueClaimer: "0xAa9D46AE079851116967c6573f961B304095C34a",
    },
    createTraitsData: {
      traitTypeNames: [
        "Knots",
        "I've Lost My Identity",
        "Facebook Official",
        "I Need Some Space",
        "Sixty Nine",
        "Monochromatic",
        "Grayscale",
        "My World Turned Upside Down",
      ],
      traitTypeValues: [
        "featureKnots",
        "featureIveLostMyIdentity",
        "featureFacebookOfficial",
        "featureINeedSomeSpace",
        "featureSixtyNine",
        "featureMonochromatic",
        "featureGrayscale",
        "featureMyWorldTurnedUpsideDown",
      ],
      traitNames: [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "true",
        "false",
        "true",
        "false",
        "true",
        "false",
        "true",
        "false",
        "true",
        "false",
        "true",
        "false",
        "true",
        "false",
      ],
      traitValues: [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "true",
        "false",
        "true",
        "false",
        "true",
        "false",
        "true",
        "false",
        "true",
        "false",
        "true",
        "false",
        "true",
        "false",
      ],
      traitTypeIndexes: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2,
        2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7,
      ],
      traitMaxRevenues: [
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
      ],
    },
    scheduleAuctionData: {
      auctionStartTime: Math.trunc(Date.now() / 1000) + 10,
      auctionEndTime: Math.trunc(Date.now() / 1000) + 10,
      auctionStartPrice: ethers.utils.parseEther("0.001"),
      auctionEndPrice: ethers.utils.parseEther("0.001"),
    },
    scripts: [
      `let dim,leftSilhouetteStyle,rightSilhouetteStyle,colorBlendStyle,numKnots,backgroundStyle,backgroundLightnessStyle,leftHairStyle,rightHairStyle,leftHairChaos,rightHairChaos,leftFlipped,rightFlipped,rotate90,faceLines,attached,drawHair,leftGenderFemale,rightGenderFemale,sparse,sixtyNine,monochromatic,grayscale,rootHue,bgSaturation,bgBrightness,bgLightness,hueDifference,lineSaturation,lineBrightness,rowEntropy,attachmentMultiplier,edgeBoldness,colorAdjustFactor,spacingMultiplier,weaveDensity,weaveVariation,weaveWidth,connectLineColorVariation,seed=parseInt(tokenData.hash.slice(0,16),16),maleFaceData=[],femaleFaceData=[];function generateUnlabeledVariable(e,a,r){if(e==a)return e;return 0==a&&(a=-1e-8),(range(e,a)/a)**r*a}function generateLabeledVariable(e,a,r){let t;for(t=0;t<r.length;t++)r[t]+=r[t-1]||0;let l=rnd()*r[r.length-1];for(t=0;t<r.length&&!(r[t]>l);t++);return e+t}function initializeVariables(){if(leftSilhouetteStyle=rangeFloor(0,4),rightSilhouetteStyle=rangeFloor(0,4),colorBlendStyle=generateLabeledVariable(0,8,[20,8,8,5,5,20,28,3,3]),backgroundStyle=generateLabeledVariable(0,6,[5,5,0,35,0,35,10]),backgroundLightnessStyle=generateLabeledVariable(0,4,[1,3,4,1,1]),leftHairChaos=generateLabeledVariable(0,1,[6,4]),rightHairChaos=generateLabeledVariable(0,1,[6,4]),numKnots=generateLabeledVariable(0,3,[75,12,8,5]),faceLines=generateLabeledVariable(0,1,[15,85]),attached=generateLabeledVariable(0,1,[4,6]),sparse=generateLabeledVariable(0,1,[92,8]),leftFlipped=sparse?0:generateLabeledVariable(0,1,[9,1]),rightFlipped=sparse?0:generateLabeledVariable(0,1,[9,1]),sixtyNine=leftFlipped!=rightFlipped,rotate90=sixtyNine,drawHair=sparse||7==colorBlendStyle||8==colorBlendStyle?0:generateLabeledVariable(0,1,[1,9]),leftGenderFemale=generateLabeledVariable(0,1,[51,49]),rightGenderFemale=rnd()<.1?leftGenderFemale:!leftGenderFemale,leftHairStyle=leftGenderFemale?generateLabeledVariable(0,4,2==leftSilhouetteStyle?[3,0,3,2,2]:[0,0,2,3,5]):2==leftSilhouetteStyle?0:generateLabeledVariable(0,4,[8,0,2,0,0]),rightHairStyle=rightGenderFemale?generateLabeledVariable(0,4,2==rightSilhouetteStyle?[3,0,3,2,2]:[0,0,2,3,5]):2==rightSilhouetteStyle?0:generateLabeledVariable(0,4,[8,0,2,0,0]),drawHair||(leftHairStyle=0,rightHairStyle=0),hairDyed=(leftHairStyle>0||rightHairStyle>0)&&generateLabeledVariable(0,1,[90,10]),grayscale=(7==colorBlendStyle||8==colorBlendStyle)&&rnd()<.2,monochromatic=generateLabeledVariable(0,1,[95,5])||grayscale,3==numKnots&&(numKnots=attached?generateUnlabeledVariable(3,6,2):generateUnlabeledVariable(3,20,1)),numKnots=featureKnots,faceLines=featureIveLostMyIdentity,attached=featureFacebookOfficial,sparse=featureINeedSomeSpace,sixtyNine=featureSixtyNine,monochromatic=featureMonochromatic,grayscale=featureGrayscale,featureMyWorldTurnedUpsideDown&&(leftFlipped=!0,rightFlipped=!0),rotate90=sixtyNine,sixtyNine&&(leftFlipped=rnd()>.5,rightFlipped=!leftFlipped),rootHue=(2*(rnd()<.5)-1)*generateUnlabeledVariable(0,180,1.25)-45,rootHue+=rootHue<0?360:0,hueDifference=generateUnlabeledVariable(0,30,2),lineSaturation=grayscale?0:generateUnlabeledVariable(90,100,1),lineBrightness=generateUnlabeledVariable(90,100,1),rowEntropy=generateUnlabeledVariable(0,1,1),attachmentMultiplier=generateUnlabeledVariable(0,1,1),edgeBoldness=attached?generateUnlabeledVariable(.4,1,1):1,colorAdjustFactor=6*generateUnlabeledVariable(1,20,2),spacingMultiplier=sparse?generateUnlabeledVariable(.05,.08,1.5):generateUnlabeledVariable(.01,.025,1),weaveDensity=generateUnlabeledVariable(1,1,1),weaveVariation=generateUnlabeledVariable(.5,.9,1),weaveWidth=generateUnlabeledVariable(.016,.018,1),connectLineColorVariation=generateUnlabeledVariable(0,1,3),faceLines||(backgroundLightnessStyle=generateLabeledVariable(0,4,[1,3,4,1,1]),backgroundStyle=generateLabeledVariable(0,6,[5,5,10,5,30,20,15])),sparse&&(backgroundLightnessStyle=generateLabeledVariable(0,4,[1,3,4,1,1]),backgroundStyle=generateLabeledVariable(0,6,[1,1,1,1,1,1,4])),!faceLines&&sparse&&(backgroundLightnessStyle=generateLabeledVariable(0,4,[2,2,3,1,1]),backgroundStyle=generateLabeledVariable(0,6,[5,5,25,5,30,5,25])),2!=backgroundStyle&&4!=backgroundStyle||(backgroundLightnessStyle=generateLabeledVariable(0,4,[0,0,6,2,2])),6==backgroundStyle&&(backgroundLightnessStyle=generateLabeledVariable(0,4,[2,9999,2,2,2])),3==backgroundStyle&&(backgroundLightnessStyle=generateLabeledVariable(0,4,[50,40,10,0,0])),6==colorBlendStyle&&(rnd()<.8?(backgroundLightnessStyle=3,backgroundStyle=generateLabeledVariable(0,6,[0,4,0,0,0,3,3])):(backgroundLightnessStyle=4,backgroundStyle=generateLabeledVariable(0,6,[0,0,0,5,0,5,0])),faceLines||(backgroundLightnessStyle=generateLabeledVariable(0,4,[15,35,20,30,0]),backgroundStyle=generateLabeledVariable(0,6,[0,0,0,3,0,4,3]))),7==colorBlendStyle&&faceLines&&(rnd()<.5?(backgroundLightnessStyle=generateLabeledVariable(0,4,[0,0,0,6,4]),backgroundStyle=generateLabeledVariable(0,6,[0,0,15,0,40,0,45])):(backgroundLightnessStyle=generateLabeledVariable(0,4,[0,5,5,3,1]),backgroundStyle=generateLabeledVariable(0,6,[0,0,0,3,0,2,5]))),8==colorBlendStyle)switch(rangeFloor(0,3)){case 0:backgroundLightnessStyle=0,backgroundStyle=generateLabeledVariable(0,6,[5,5,20,0,0,0,70]);break;case 1:backgroundLightnessStyle=1,backgroundStyle=generateLabeledVariable(0,6,[5,5,0,0,0,50,40]);break;case 2:backgroundLightnessStyle=2,backgroundStyle=generateLabeledVariable(0,6,[5,5,90,0,0,0,0])}switch(backgroundLightnessStyle){case 0:bgBrightness=generateUnlabeledVariable(5,20,1),bgSaturation=generateUnlabeledVariable(50,100,1),bgLightness=generateUnlabeledVariable(2,15,1.5);break;case 1:bgBrightness=generateUnlabeledVariable(15,30,1),bgSaturation=generateUnlabeledVariable(50,90,1),bgLightness=generateUnlabeledVariable(15,25,1);break;case 2:bgBrightness=generateUnlabeledVariable(70,90,1),bgSaturation=generateUnlabeledVariable(100,100,1),bgLightness=generateUnlabeledVariable(75,85,1);break;case 3:bgBrightness=generateUnlabeledVariable(95,99,1),bgSaturation=generateUnlabeledVariable(80,100,1),bgLightness=generateUnlabeledVariable(90,90,1);break;case 4:bgBrightness=generateUnlabeledVariable(80,90,1),bgSaturation=generateUnlabele`,
      `dVariable(70,90,1),bgLightness=generateUnlabeledVariable(80,90,1);break;default:bgBrightness=generateUnlabeledVariable(0,4,1),bgSaturation=generateUnlabeledVariable(50,100,1),bgLightness=generateUnlabeledVariable(0,4,1)}grayscale&&(bgSaturation=0)}function gradientLine(e,a,r,t,l,n,o,i){const g=e.createLinearGradient(a,r,t,l);g.addColorStop(0,n),g.addColorStop(1,o),e.strokeStyle=g,e.lineWidth=i,e.lineCap="round",e.beginPath(),e.moveTo(a,r),e.lineTo(t,l),e.stroke()}function setup(){initializeVariables(),strokeCap(SQUARE),dim=Math.min(windowWidth,windowHeight),createCanvas(dim,dim),createFaceData(),drawFace(0,0,dim)}function createFaceData(){let e=[48,78,110,135,160,180,200,220,240,260,280,300,315,330,345,360,375,390,400,410,420,430,440,450,460,470,480,490,500,510,505,510,515,520,525,530,535,540,545,550,555,560,565,568,571,571,571,571,571,571,571,571,568,565,562,559,554,550,545,535,525,515,505,495,480,465,450,430,410,390,381,362,352,333,324,314,314,314,314,314,324,333,343,352,362,381,390,410,419,438,457,476,495,514,533,552,571,600,619,638,657,686,705,724,743,771,800,819,838,857,886,914,950,975,985,990,995,995,990,990,970,952,933,905,867,800,743,686,667,657,657,667,676,686,695,705,724,743,771,790,800,800,800,790,781,762,752,733,714,686,648,610,581,571,581,600,619,638,657,676,686,686,686,676,667,648,629,590,543,505,476,467,457,457,457,457,467,476,480,484,488,492,492,492,488,484,478,465,450,440,418,380,330,280,200,110];femaleFaceData.push(e),femaleFaceData.push([167,151,143,143,143,143,143,143,143,151,159,167,167,167,175,183,190,198,214,230,246,254,270,278,294,302,317,333,357,373,389,397,413,421,437,444,452,460,468,476,484,492,500,500,508,516,524,524,532,540,548,548,548,548,540,532,516,500,484,468,460,444,429,405,381,357,341,325,333,357,357,405,333,310,310,333,381,349,365,373,389,397,413,421,437,452,476,500,524,548,571,595,619,651,683,714,738,762,786,817,849,881,905,929,944,960,968,984,992,1e3,1e3,992,984,976,976,960,937,905,881,841,794,738,690,651,619,603,595,595,595,595,595,603,611,619,627,635,651,659,675,690,698,690,675,659,635,595,548,524,524,556,587,619,627,619,603,587,571,556,540,532,516,508,492,484,476,468,460,460,468,476,484,492,500,500,500,500,500,500,500,492,484,476,468,460,452,444,429,413,397,365,310,246,183,103,60,0]),femaleFaceData.push([42,83,111,139,153,181,194,208,222,236,250,264,278,292,306,333,361,375,375,375,389,403,431,444,458,458,458,472,486,500,500,500,500,514,528,542,542,542,542,542,542,542,542,542,542,542,542,542,542,542,542,542,542,528,514,500,500,500,486,472,458,458,444,431,403,389,375,361,347,333,333,319,306,292,292,292,292,333,417,375,333,250,278,292,292,306,319,347,361,389,403,431,458,500,542,583,611,639,667,708,750,792,833,875,917,944,972,986,1e3,1e3,1e3,1e3,1e3,1e3,1e3,986,972,944,931,917,903,806,694,597,583,597,611,625,639,653,681,694,722,750,792,833,861,875,875,875,875,861,847,833,819,792,750,694,639,625,667,722,764,778,806,819,833,833,833,833,819,806,792,764,708,639,583,556,542,542,542,542,542,556,569,583,583,583,583,583,583,569,556,542,542,542,528,514,486,472,444,417,361,292,250,208]),femaleFaceData.push([78,67,67,67,56,44,22,11,11,33,56,78,100,133,156,178,189,211,222,244,256,267,278,289,300,300,311,322,333,344,356,367,378,389,400,400,411,422,433,433,433,433,444,456,467,467,467,467,467,467,467,467,467,467,467,467,456,444,433,422,411,389,378,367,356,344,333,333,344,356,356,333,311,300,300,311,322,333,344,356,378,389,411,422,433,433,444,467,489,511,533,556,578,600,622,656,678,711,722,744,767,789,811,833,878,911,944,967,989,1e3,1e3,1e3,1e3,1e3,1e3,1e3,989,978,956,922,878,833,789,733,689,656,644,633,633,633,644,656,667,678,700,733,767,789,800,800,789,778,767,756,733,689,633,611,622,678,711,733,733,733,722,711,700,667,622,567,544,533,522,500,478,467,478,489,500,500,500,500,511,522,533,533,533,533,533,522,511,500,489,478,467,456,444,422,411,389,356,300,233,156,117,67]),maleFaceData.push(e),maleFaceData.push([322,310,310,322,333,345,345,345,356,368,379,391,402,414,425,437,448,460,471,483,494,506,517,517,529,540,552,552,552,552,563,575,586,586,598,609,621,621,621,632,644,655,655,655,655,655,655,655,655,655,655,655,655,644,632,621,609,586,552,517,494,483,471,460,437,414,391,368,379,391,402,379,356,356,379,391,402,402,425,437,460,471,494,517,552,586,621,655,690,713,736,747,770,782,793,805,816,839,851,874,885,908,920,943,954,966,977,989,1e3,1e3,1e3,1e3,1e3,1e3,1e3,989,977,966,954,931,897,828,759,701,678,667,655,655,655,655,655,667,678,690,701,713,736,747,770,782,793,793,793,793,770,724,667,632,632,667,713,736,736,724,724,713,690,667,644,632,609,598,575,563,540,529,529,540,552,552,563,575,598,609,621,621,621,609,598,586,586,575,563,552,540,529,506,494,471,448,391,310,218,115,69,0]),maleFaceData.push([120,140,165,195,220,240,270,295,330,350,370,390,410,430,445,460,475,490,500,510,520,530,540,550,560,570,575,580,585,590,595,600,605,607,610,613,615,617,619,621,623,625,625,625,625,625,625,623,621,619,616,613,610,607,603,599,595,590,585,575,565,555,545,535,520,510,485,455,420,390,370,350,330,320,310,305,300,300,300,300,305,310,320,330,350,370,390,410,430,450,470,490,510,530,560,590,620,644,689,711,756,778,822,844`,
      `,885,910,925,945,955,965,980,990,990,990,990,980,970,956,911,889,844,711,556,470,450,450,460,480,490,520,556,578,630,670,720,755,770,776,778,776,774,772,750,735,710,676,640,600,560,500,540,610,660,690,710,720,733,733,733,733,725,700,680,660,578,500,470,440,430,440,450,470,490,515,520,525,530,532,535,535,532,530,520,500,490,480,470,455,440,420,395,360,320,270,180,0]),maleFaceData.push([127,143,159,175,206,222,230,240,254,270,302,315,330,340,349,370,388,405,418,430,440,445,455,460,464,468,472,476,480,484,488,492,500,508,515,520,525,528,531,534,537,537,537,537,537,537,537,534,531,528,525,520,515,508,492,492,492,492,476,460,444,429,413,397,381,381,365,349,333,333,317,305,302,302,305,305,325,333,349,365,381,397,413,429,444,460,476,492,508,540,556,587,603,635,651,683,698,730,746,778,794,825,841,873,889,921,937,968,984,1e3,1e3,1e3,1e3,1e3,1e3,984,968,937,905,825,746,667,619,571,540,524,524,524,540,556,587,603,635,651,683,714,746,762,762,762,762,762,746,730,698,667,619,587,620,660,690,705,714,714,698,683,667,651,603,540,492,476,476,460,460,444,460,460,476,476,485,495,505,515,522,522,522,522,522,522,520,515,512,508,500,485,480,468,455,430,410,380,350,280,180,0])}function drawFace(e,a,r){push(),translate(e,a);let t,l,n,o,i,g,s=[],d=[],c=!0,b=!0;switch(leftHairStyle){case 0:c=!1,t=0,l=0,n=0;break;case 1:t=generateUnlabeledVariable(.15,.25,3),l=generateUnlabeledVariable(1,5,3),n=range(.02,.06),leftHairChaos=generateLabeledVariable(-1,1,[600,200,200]);break;case 2:t=range(.6,.8),l=10,n=.1;break;case 3:t=1,l=10,n=.16;break;case 4:t=1,l=5,n=.06}switch(rightHairStyle){case 0:b=!1,o=0,i=0,g=0;break;case 1:o=generateUnlabeledVariable(.15,.25,3),i=generateUnlabeledVariable(1,5,3),g=range(.02,.06),rightHairChaos=generateLabeledVariable(-1,1,[6,2,2]);break;case 2:o=range(.6,.8),i=10,g=.1;break;case 3:o=1,i=10,g=.16;break;case 4:o=1,i=5,g=.06}s=leftGenderFemale?[...femaleFaceData[leftSilhouetteStyle]]:[...maleFaceData[leftSilhouetteStyle]],d=rightGenderFemale?[...femaleFaceData[rightSilhouetteStyle]]:[...maleFaceData[rightSilhouetteStyle]],leftFlipped&&s.reverse(),rightFlipped&&d.reverse();let h,u=spacingMultiplier*r,S=Math.round(r/u),f=Array.from(Array(S).keys()),p=.19;h=attached?map(attachmentMultiplier,0,1,.16,p):map(attachmentMultiplier,0,1,.08,.11);let m=r*h,V=.65+range(0,1.25*rowEntropy),y=r*range(.2,.22)*.001,k=r*(.016*h-.001),F=-k;leftFlipped!=rightFlipped&&(k*=-1),colorMode(HSB),hueDifference*=(rnd()<.5?-1:1)*!monochromatic;let L=rangeFloor(-1,2)*!monochromatic,U=rootHue+!monochromatic*(rnd()<.5?-1:1)*rangeFloor(4,6)*10,M=rootHue+hueDifference,H=rootHue-hueDifference,B=color(M,lineSaturation,lineBrightness),w=color(H,lineSaturation,lineBrightness),C=color(U+3*hueDifference,lineSaturation,lineBrightness),D=color(U+!monochromatic*L*rangeFloor(0,3)*10,bgSaturation+range(-10,10),bgBrightness),v=color(U+!monochromatic*L*rangeFloor(0,3)*10,bgSaturation+range(-10,10),bgBrightness);colorMode(HSL),D=color(hue(D),saturation(D),bgLightness),v=color(hue(v),saturation(v),bgLightness),colorMode(RGB);let x=rnd()<.5?C:lerpColor(B,w,.5);colorMode(HSB);let G=color(0,0,0,.2),W=color(0,0,0,.08);shuffleArrayEntropy(f,rowEntropy);let E,A,z,R,K,I,N,j,Y,T,Q,X,O=2*u,P=0,q=0;switch(noFill(),backgroundStyle){case 0:setGradient(0,0,r,r,D,v,"Y",range(1,3));break;case 1:setGradient(0,0,r,r,v,D,"Y",range(1,3));break;case 2:P=range(.2,.6),T=rangeFloor(80,120);case 3:P<.1&&(P=.04,T=rangeFloor(80,120)),setGradient(0,0,r,r,D,v,"Y",range(1,3));for(let e=0;e<T;e++){let e=range(.1,5),a=generateUnlabeledVariable(.01,P,2);colorMode(HSB);let t=color(hue(x)+10*rangeFloor(-10,10)*!monochromatic,.5*saturation(x),brightness(x),a),l=range(40*-u,40*u),n=r*range(.01,.3);strokeWeight(O*e),Y=O*range(-.25,4),E=rnd()<.5?range(0,r):rangeFloor(0,2)*r,A=E%r==0?range(0,r/2):0,z=E+l,R=A+n,K=rnd()<.5?range(0,r):rangeFloor(0,2)*r,I=K%r==0?range(r/2,r):r,N=K-l,j=I-n,strokeWeight(Y),stroke(t),bezier(E,A,z,R,N,j,K,I)}break;case 4:P=range(.4,.8);case 5:P<.1&&(P=.08),T=rangeFloor(20,60),colorMode(HSL),q=rangeFloor(-1,2),D=color(hue(D)+q*generateUnlabeledVariable(0,180,5)*!monochromatic,saturation(D),bgLightness),v=color(hue(v)+q*generateUnlabeledVariable(0,180,5)*!monochromatic,saturation(v),bgLightness),colorMode(HSB),setGradient(0,0,r,r,v,D,"Y",range(1,3));for(let e=0;e<T;e++){let e=range(.1,20),a=generateUnlabeledVariable(.01,P,2);colorMode(HSL);let t=color(hue(x)+5*rangeFloor(-20,20)*!monochromatic,1*saturation(x),range(50,95),a);colorMode(HSB);let l=0,n=r*range(.01,.3);strokeWeight(O*e),Y=O*range(-.25,4),E=rnd()<.5?range(0,r):rangeFloor(0,2)*r,A=E%r==0?range(0,r/2):0,z=E+l,R=A+n,K=rnd()<.5?range(0,r):rangeFloor(0,2)*r,I=K%r==0?range(r/2,r):r,N=K-l,j=I-n,strokeWeight(Y),stroke(t),bezier(E,A,z,R,N,j,K,I)}break;case 6:0==backgroundLightnessStyle||1==backgroundLightnessStyle||faceLines&&!sparse?(P=.05,T=rangeFloor(50,200),Q=.5):(P=range(.15,.3),T=rangeFloor(50,100),Q=1),colorMode(HSL),q=rangeFloor(-1,2),D=color(hue(D)+q*generateUnlabeledVariable(0,180,5)*!monochromatic,saturation(D)*Q,bgBrightness),v=color(hue(v)+q*generateUnlabeledVariable(0,180,5)*!monochromatic,saturation(v)*Q,bgBrightness),color`,
      `Mode(HSB),setGradient(0,0,r,r,v,D,"Y",range(1,3));for(let e=0;e<T;e++){q=2*rangeFloor(0,2)-1;let e=generateUnlabeledVariable(0,P,2);colorMode(HSL);let a=color(hue(x)+q*generateUnlabeledVariable(0,20,2.5)*8*!monochromatic,1*saturation(x),range(50,95),e);colorMode(HSB),noStroke();let t=.05*r*generateUnlabeledVariable(3,16,2);fill(a),ellipseMode(CENTER),circle(.5*r+q*generateUnlabeledVariable(0,.5*r,1),.55*r+q*generateUnlabeledVariable(0,.45*r,3),t)}}angleMode(DEGREES),rotate90&&(translate(r,0),rotate(90));let J=generateUnlabeledVariable(0,8,1),Z=rangeFloor(0,12),$=drawHair+1,_=rnd()<.5,ee=[];for(let e=0;e<numKnots;e++)ee.push(range(-(p-h),p-h)*r*1.5);noFill();for(let e=0;e<$;e++)for(let a=e;a<S;a+=$){let e,h,p,L,U,C,v,x,E,A,z,R,K;switch(curIndexLeft=Math.round(a/S*s.length),curIndexRight=Math.round(f[a]/S*s.length),_?(h=f[a]*u+.125*u,p=a*u+.625*u,e=m+s[curIndexRight]*y+k*f[a],L=Math.round(r-m-d[curIndexLeft]*y+F*a)):(h=a*u+.125*u,p=f[a]*u+.625*u,e=m+s[curIndexLeft]*y+k*a,L=Math.round(r-m-d[curIndexRight]*y+F*f[a])),U=(L-e)*V,C=color(M,lineSaturation,lineBrightness),v=color(H,lineSaturation,lineBrightness),z=range(.5*-colorAdjustFactor,colorAdjustFactor)*!monochromatic,R=range(-colorAdjustFactor,1.8*colorAdjustFactor)*!monochromatic,K=range(.5*-colorAdjustFactor,colorAdjustFactor)*!monochromatic,colorMode(HSB),C.setGreen(green(C)+z),C.setBlue(blue(C)+R),C.setRed(red(C)+K),v.setGreen(green(v)+z),v.setBlue(blue(v)+R),v.setRed(red(v)+K),colorBlendStyle){case 0:A=lerpColor(B,w,.5),x=C,E=v;break;case 1:A=C,x=C,E=v;break;case 2:A=v,x=C,E=v;break;case 3:A=C,x=C,E=C;break;case 4:A=v,x=v,E=v;break;case 5:C=color(hue(C)+(rnd()<.5?-1:1)*(generateUnlabeledVariable(3,18,1)*!monochromatic),saturation(C),brightness(C)),v=color(hue(v)+(rnd()<.5?-1:1)*(generateUnlabeledVariable(3,18,1)*!monochromatic),saturation(v),brightness(v)),A=rnd()<.5?C:v,x=C,E=v;break;case 6:C=color(hue(C)+(rnd()<.5?-1:1)*(generateUnlabeledVariable(3,6,1)*!monochromatic),saturation(C)+rangeFloor(-30,-40),brightness(C)),v=color(hue(v)+(rnd()<.5?-1:1)*(generateUnlabeledVariable(3,6,1)*!monochromatic),range(20,50),brightness(v)),A=rnd()<.5?C:v,x=C,E=v;break;case 7:C=color(hue(C),rangeFloor(0,100)*!monochromatic,J+rangeFloor(-Z,Z)),v=color(hue(v),rangeFloor(0,100)*!monochromatic,J+rangeFloor(-Z,Z)),A=C,x=C,E=v;break;case 8:C=color(hue(C),rangeFloor(50,100)*!monochromatic,100+rangeFloor(-Z,Z)),v=color(hue(v),rangeFloor(50,100)*!monochromatic,100+rangeFloor(-Z,Z)),colorMode(HSL),C=color(hue(C),saturation(C),100-rangeFloor(0,J)),v=color(hue(v),saturation(v),100-rangeFloor(0,J)),A=C,x=C,E=v,colorMode(HSB);break;default:A=lerpColor(C,v,.5),x=C,E=v}faceLines||(C=color(hue(C)+(rnd()<.5?-1:1)*rangeFloor(3,7),saturation(C)+rangeFloor(-30,-40)*!monochromatic,brightness(C)),v=color(hue(v)+(rnd()<.5?-1:1)*rangeFloor(3,7),range(20,50)*!monochromatic,brightness(v)),A=rnd()<.5?color(hue(A)+range(-180*connectLineColorVariation,180*connectLineColorVariation),saturation(A)*!monochromatic,brightness(A)):rnd()<.5?C:v);let I=.0015*r;colorMode(RGB),x=lerpColor(D,x,edgeBoldness),E=lerpColor(D,E,edgeBoldness),colorMode(HSB),X=A,stroke(A),strokeWeight(I),noFill();let N=Math.abs(S/2-a)/(S/2);if(attached||N<attachmentMultiplier||!faceLines)if(0==numKnots){let a=L+1.5*I,r=e-1.5*I,t=p,l=h;stroke(W),strokeWeight(1.5*I),bezier(r,l+I,r+U,l+I,a-U,t+I,a,t+I),stroke(A),strokeWeight(I),bezier(r,l,r+U,l,a-U,t,a,t)}else{let a=rangeFloor(1,numKnots+1),t=Math.round(a*(S/(numKnots+1))),l=m+s[t]*y+k*t,n=Math.round(r-m-d[t]*y+F*t),o=.1*(n-l)*V*range(1-.2*rowEntropy,1+.2*rowEntropy),i=(l+n)/2+range(-o,o)*rowEntropy*.3+ee[a-1],g=r/(numKnots+1)*a;stroke(W),strokeWeight(1.5*I),beginShape(),vertex(e-1.5*I,h+I),bezierVertex(i+o,h+I,i+o,g-o*(h/r/2)+I,i,g+I),bezierVertex(i-o,g+o*(h/r/2)+I,i-o,p+I,L,p+I),vertex(L+1.5*I,p+I),endShape(),stroke(A),strokeWeight(I),beginShape(),vertex(e-1.5*I,h),bezierVertex(i+o,h,i+o,g-o*(h/r/2),i,g),bezierVertex(i-o,g+o*(h/r/2),i-o,p,L,p),vertex(L+1.5*I,p),endShape()}if(stroke(A),faceLines){noStroke(),fill(G),triangle(e,h,e-.75*u,h,e-.75*u,h+.5*u),triangle(L,p,L+.75*u,p,L+.75*u,p+.5*u),fill(A),triangle(e,h,e-.75*u,h-.25*u,e-.75*u,h+.25*u),triangle(L,p,L+.75*u,p-.25*u,L+.75*u,p+.25*u)}else noStroke(),fill(G),circle(e,h+.125*u,.375*u),circle(L,p+.125*u,.375*u),fill(A),circle(e,h,.375*u),circle(L,p,.375*u);if(faceLines){fill(G),noStroke(),rect(0,h-.25*u,e-.75*u,.75*u),noFill(),stroke(A),gradientLine(drawingContext,Math.round(e-13*u/16),h,0,h,A,x,u/2);let a=m+s[0+leftFlipped*(s.length-1)]*y+.15*r,S=r-m-d[0+rightFlipped*(s.length-1)]*y-.15*r,f=h<r/2;if(drawHair&&rnd()<weaveDensity&&(h<a&&c||h>S&&b)){let e,a,s,d,c,b,S,p,m,V,y=7==colorBlendStyle?1:generateUnlabeledVariable(.4,1,1),k=color(hue(X)+range(-hueDifference,hueDifference)*!monochromatic,1*saturation(X),1*brightness(X),y),F=color(hue(G),saturation(G),brightness(G),alpha(G)*y),L=r*(weaveWidth+weaveWidth*range(-.4*weaveVariation,3*weaveVariation)),U=Math.round(h+u/4);f?(m=range(leftHairChaos*u*l,u*l),V=range(-u*l,leftHairChaos*u*l),e=U-.1*r,a=.02*-r,s=U+m-.1*r,d=t*r*.25-.001*r,S=U+V-n*r-.1*r,p=t*r*.75,c=U-n*r-.1*r,b=t*r+range(t*leftH`,
      `airChaos*-.15*r,.15*t*r)):(m=range(-u*i,rightHairChaos*u*i),V=range(rightHairChaos*u*i,u*i),e=U+.1*r,a=.02*-r,s=U+m+.1*r,d=o*r*.25-.001*r,S=U+V+g*r+.1*r,p=o*r*.75,c=U+g*r+.1*r,b=o*r+range(o*rightHairChaos*-.15*r,.15*o*r)),strokeWeight(L),stroke(F),strokeCap(SQUARE),noFill(),(f&&leftFlipped||!f&&rightFlipped)&&applyMatrix(1,0,0,-1,0,r),bezier(e+u/16,a,s+u/16,d,S+u/16,p,c+u/16,b),stroke(k),bezier(e,a,s,d,S,p,c,b),(f&&leftFlipped||!f&&rightFlipped)&&(resetMatrix(),rotate90&&(translate(r,0),rotate(90)))}fill(G),noStroke(),rect(L+.75*u,p-.25*u,r,.75*u),noFill(),stroke(A),gradientLine(drawingContext,Math.round(L+13*u/16),p,r,p,A,x,u/2)}}pop()}function setGradient(e,a,r,t,l,n,o,i){if(noFill(),strokeWeight(1.5),colorMode(RGB),"Y"==o)for(let o=a;o<=a+t;o++){var g=map(o,a,a+t,0,1),s=lerpColor(l,n,Math.pow(g,i));stroke(s),line(e,o,e+r,o)}else if("Xlr"==o)for(let o=e;o<=e+r;o++){var d=map(o,e,e+r,0,1),c=lerpColor(l,n,Math.pow(d,i));stroke(c),line(o,a,o,a+t)}else if("Xrl"==o)for(let o=e;o>=e-r;o--){var b=map(o,e,e-r,0,1);c=lerpColor(l,n,Math.pow(b,i));stroke(c),line(o,a,o,a+t)}colorMode(HSB)}function shuffleArrayEntropy(e,a){for(let r=0;r<e.length;r++){let t=r-Math.round(r*a),l=r+Math.round((e.length-1-r)*a);const n=Math.round(range(t,l));[e[r],e[n]]=[e[n],e[r]]}}function rnd(){return seed^=seed<<13,seed^=seed>>17,seed^=seed<<5,(seed<0?1+~seed:seed)%1e3/1e3}function range(e,a){return void 0===a&&(a=e,e=0),rnd()*(a-e)+e}function rangeFloor(e,a){return void 0===a&&(a=e,e=0),Math.floor(range(e,a))}`,
    ],
  },
  {
    studioConstructorData: {
      name: "intrinsic.art Tack Line Torn",
      symbol: "INSC",
      baseURI: "https://api.intrinsic.art/",
      scriptJSON: `{
        "name": "Tack Line Torn",
        "description": "Tack Line Torn is a generative art project that takes the viewer on a visual journey through the chaos of a tearing sail tack line. In sailing, a tack line is crucial to the stability and direction of a vessel, and in this project, the once-reliable line is portrayed as it breaks apart in real-time. The piece is a representation of the unpredictable nature of life, as the path of fragmentation is unique with each viewing. The project is a visual and auditory experience, as the tearing of the tack line is accompanied by a dynamic soundscape that adds to the sense of chaos and unpredictability. The fragmented line symbolizes the loss of control and the fragility of stability, and invites the viewer to contemplate the beauty that can be found in the midst of destruction. Tack Line Torn is an immersive and thought-provoking generative art project that explores the themes of unpredictability, transience, and the beauty of chaos.",
        "artistName": "Phil Smith",
        "website": "https://tacklinetorn.com",
        "license": "MIT",
        "scriptLibrary": "p5.js",
        "scriptLibraryVersion": "1.0.0",
        "aspectRatio": "1"
      }`,
      artistAddress: "0xAa9D46AE079851116967c6573f961B304095C34a",
      owner: "0xAa9D46AE079851116967c6573f961B304095C34a",
    },
    traitsConstructorData: {
      uri: "https://api.intrinsic.art/",
      owner: "0xAa9D46AE079851116967c6573f961B304095C34a",
      platformRevenueClaimer: "0xAa9D46AE079851116967c6573f961B304095C34a",
      artistRevenueClaimer: "0xAa9D46AE079851116967c6573f961B304095C34a",
    },
    createTraitsData: {
      traitTypeNames: ["Palette", "Complexity", "Organization", "Symmetry"],
      traitTypeValues: ["palette", "complexity", "organization", "symmetry"],
      traitNames: [
        "Warm",
        "Cool",
        "Mixed",
        "Minimal",
        "Balanced",
        "Complex",
        "Chaotic",
        "Ordered",
        "Emergent",
        "Mirror",
        "Rotational",
        "Asymmetric",
      ],
      traitValues: [
        "warm",
        "cool",
        "mixed",
        "minimal",
        "balanced",
        "complex",
        "chaotic",
        "ordered",
        "emergent",
        "mirror",
        "rotational",
        "asymmetric",
      ],
      traitTypeIndexes: [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3],
      traitMaxRevenues: [
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
        ethers.utils.parseEther("0.1"),
      ],
    },
    scheduleAuctionData: {
      auctionStartTime: Math.trunc(Date.now() / 1000) + 10,
      auctionEndTime: Math.trunc(Date.now() / 1000) + 10,
      auctionStartPrice: ethers.utils.parseEther("0.001"),
      auctionEndPrice: ethers.utils.parseEther("0.001"),
    },
    scripts: [
      `let seed,imageDimension;function setup(){seed=parseInt(tokenData.hash.slice(0,16),16),imageDimension=Math.min(windowWidth,windowHeight),createCanvas(imageDimension,imageDimension),getArt(tokenData.hash)}function getArt(e){let a,n,r,i,g,s,o,t,c;switch(seed=parseInt(e.slice(0,16),16),complexity){case"minimal":t=range(1,4);break;case"balanced":t=range(16,24);break;case"complex":t=range(40,48)}switch(colorMode(HSB,360,100,100,100),push(),palette){case"warm":c=range(270,450)%360;break;case"cool":c=range(91,269);break;case"mixed":c=range(0,360)}background(c,rangeFloor(60,100),rangeFloor(80,100)),r=range(-1,1),i=range(-.5,.5),g=range(-1,1),s=range(-1,1),n=range(.05,.8)*imageDimension,o=0;for(let e=0;e<t;e++){switch(push(),palette){case"warm":c=range(270,450)%360;break;case"cool":c=range(91,269);break;case"mixed":`,
      `c=(c+range(140,220))%360}switch(a=color(c,100,100,15),stroke(a),strokeWeight(.001*imageDimension),angleMode(DEGREES),organization){case"chaotic":r=range(-1,1),i=range(-.5,.5),g=range(-1,1),s=range(-1,1),n=range(.05,.8)*imageDimension,o=range(0,.01);break;case"ordered":break;case"emergent":r=range(-1,1),i=range(-.5,.5),g=range(-1,1),s=range(-1,1),n=range(.05,.8)*imageDimension}translate(range(0,imageDimension),range(0,imageDimension));for(let e=0;e<2*imageDimension;e++)push(),rotate(e*r*range(1-2*o,1+2*o)),line(0,0,0,n*range(1-o,1+o)),pop(),rotate(i),translate(g*range(1-o,1+o),s*range(1-o,1+o));pop()}return canvas.toDataURL()}function rnd(){return seed^=seed<<13,seed^=seed>>17,seed^=seed<<5,(seed<0?1+~seed:seed)%1e3/1e3}function range(e,a){return void 0===a&&(a=e,e=0),rnd()*(a-e)+e}function rangeFloor(e,a){return void 0===a&&(a=e,e=0),Math.floor(range(e,a))}`,
    ],
  },
];

export default projectConfigs;

// import { useState } from "react";
// import { Alert, Platform } from "react-native";
// // import RNHTMLtoPDF from "react-native-html-to-pdf";
// // import Share from "react-native-share";
// import { Profile } from "@/types/profile";

// export const useProfileActions = (targetProfile: Profile) => {
//   const [isProcessing, setIsProcessing] = useState(false);

//   const generateAndSharePDF = async () => {
//     setIsProcessing(true);
//     try {
//       // 1. Create HTML Template (Aesthetic & Clean)
//       const htmlContent = `
//         <html>
//           <body style="font-family: Helvetica; padding: 20px;">
//             <h1 style="color: #6B46C1;">${targetProfile.fullName}</h1>
//             // <p><b>Age:</b> ${targetProfile.age}</p>
//             <p><b>Education:</b> ${targetProfile.highestQualification}</p>
//             <p><b>Profession:</b> ${targetProfile.occupation}</p>
//             <hr/>
//             <h3>About Me</h3>
//             <p>${targetProfile.shortBio || "No bio provided."}</p>
//           </body>
//         </html>
//       `;

//       // 2. Convert to PDF
//       const options = {
//         html: htmlContent,
//         fileName: `Profile_${targetProfile.fullName.replace(/\s/g, "_")}`,
//         directory: "Documents",
//       };

//       const file = await RNHTMLtoPDF.convert(options);

//       // 3. Share via WhatsApp
//       const shareOptions = {
//         title: "Share Profile",
//         url:
//           Platform.OS === "android" ? `file://${file.filePath}` : file.filePath,
//         social: Share.Social.WHATSAPP,
//         type: "application/pdf",
//       };

//       await Share.shareSingle(shareOptions);
//     } catch (error) {
//       Alert.alert("Error", "Could not generate or share PDF.");
//       console.error(error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleBlock = () => {
//     Alert.alert(
//       "Block User",
//       `Are you sure you want to block ${targetProfile.fullName}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Block",
//           style: "destructive",
//           onPress: () => console.log("User Blocked"), // Add your API call here
//         },
//       ],
//     );
//   };

//   return { generateAndSharePDF, handleBlock, isProcessing };
// };

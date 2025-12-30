module.exports=[41675,a=>{"use strict";let b=(0,a.i(70106).default)("calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);a.s(["Calendar",()=>b],41675)},69012,a=>{"use strict";let b=(0,a.i(70106).default)("funnel",[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]]);a.s(["Filter",()=>b],69012)},14954,a=>{a.v({container:"reports-module__u2SaAW__container",excelBtn:"reports-module__u2SaAW__excelBtn",exportBtn:"reports-module__u2SaAW__exportBtn",exportButtons:"reports-module__u2SaAW__exportButtons",exportCard:"reports-module__u2SaAW__exportCard",filterGroup:"reports-module__u2SaAW__filterGroup",filtersCard:"reports-module__u2SaAW__filtersCard",filtersGrid:"reports-module__u2SaAW__filtersGrid",header:"reports-module__u2SaAW__header",loader:"reports-module__u2SaAW__loader",loadingOverlay:"reports-module__u2SaAW__loadingOverlay",pdfBtn:"reports-module__u2SaAW__pdfBtn",reportTypeCard:"reports-module__u2SaAW__reportTypeCard",reportTypeIcon:"reports-module__u2SaAW__reportTypeIcon",reportTypeInfo:"reports-module__u2SaAW__reportTypeInfo",reportTypes:"reports-module__u2SaAW__reportTypes",sectionTitle:"reports-module__u2SaAW__sectionTitle",selected:"reports-module__u2SaAW__selected",spin:"reports-module__u2SaAW__spin",subtitle:"reports-module__u2SaAW__subtitle",title:"reports-module__u2SaAW__title"})},76138,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(4720),e=a.i(70106);let f=(0,e.default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);var g=a.i(41675),h=a.i(60246),i=a.i(21374),j=a.i(76803),k=a.i(69012);let l=(0,e.default)("file-spreadsheet",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]]);var m=a.i(14954);function n(){let[a,e]=(0,c.useState)([]),[n,o]=(0,c.useState)(!1),[p,q]=(0,c.useState)("summary"),[r,s]=(0,c.useState)(""),[t,u]=(0,c.useState)(new Date(new Date().setMonth(new Date().getMonth()-1)).toISOString().split("T")[0]),[v,w]=(0,c.useState)(new Date().toISOString().split("T")[0]);(0,c.useEffect)(()=>{x()},[]);let x=async()=>{try{let a=await fetch("/api/teachers?limit=100&status=active"),b=await a.json();e(b.teachers||[])}catch(a){console.error("Failed to fetch teachers:",a)}},y=async a=>{o(!0);try{let d=new URLSearchParams({type:p,format:a,startDate:t,endDate:v});r&&d.set("teacherId",r);let e=await fetch(`/api/reports?${d}`);if(!e.ok)throw Error("Failed to generate report");if("excel"===a){let a=await e.blob(),b=window.URL.createObjectURL(a),c=document.createElement("a");c.href=b,c.download=`report-${p}-${new Date().toISOString().split("T")[0]}.xlsx`,document.body.appendChild(c),c.click(),window.URL.revokeObjectURL(b),document.body.removeChild(c)}else{let a=await e.json();if(a.success&&a.data){var b,c;let d,e,f,g;b=a.data,c={type:p,startDate:t,endDate:v},d="attendance"===c.type?"تقرير الحضور والانصراف":"evaluations"===c.type?"تقرير التقييمات":"التقرير الشامل",e=b.length>0?Object.keys(b[0]):[],f=`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>${d}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Tajawal', 'Arial', sans-serif;
            padding: 20px;
            background: white;
            direction: rtl;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
        }
        
        .header h1 {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #6b7280;
            font-size: 14px;
            margin: 5px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        th {
            background: #3b82f6;
            color: white;
            padding: 12px 8px;
            text-align: center;
            font-weight: 600;
            font-size: 14px;
            border: 1px solid #2563eb;
        }
        
        td {
            padding: 10px 8px;
            border: 1px solid #e5e7eb;
            font-size: 13px;
            text-align: center;
        }
        
        tr:nth-child(even) {
            background: #f9fafb;
        }
        
        tr:hover {
            background: #f3f4f6;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        
        @media print {
            body { padding: 10px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${d}</h1>
        <p>الفترة: من ${c.startDate||"-"} إلى ${c.endDate||"-"}</p>
        <p>تاريخ الإنشاء: ${new Date().toLocaleDateString("ar-SA")}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                ${e.map(a=>`<th>${a}</th>`).join("")}
            </tr>
        </thead>
        <tbody>
            ${b.map(a=>`
                <tr>
                    ${e.map(b=>`<td>${a[b]??"-"}</td>`).join("")}
                </tr>
            `).join("")}
        </tbody>
    </table>
    
    <div class="footer">
        <p>منصة متابعة أداء المدرسين - تم إنشاء هذا التقرير آلياً</p>
    </div>
    
    <script>
        // Auto-print when page loads
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>`,(g=window.open("","_blank"))&&(g.document.write(f),g.document.close())}else throw Error(a.error||"Failed to generate report")}}catch(a){console.error("Failed to generate report:",a),alert("حدث خطأ في إنشاء التقرير")}finally{o(!1)}},z=[{id:"summary",label:"تقرير شامل",icon:(0,b.jsx)(d.FileText,{size:24}),description:"ملخص شامل للأداء والحضور والتقييمات"},{id:"attendance",label:"تقرير الحضور",icon:(0,b.jsx)(j.ClipboardCheck,{size:24}),description:"تفاصيل سجل الحضور والانصراف"},{id:"evaluations",label:"تقرير التقييمات",icon:(0,b.jsx)(i.Star,{size:24}),description:"تفاصيل تقييمات الأداء"}];return(0,b.jsxs)("div",{className:m.default.container,children:[(0,b.jsx)("div",{className:m.default.header,children:(0,b.jsxs)("div",{children:[(0,b.jsx)("h1",{className:m.default.title,children:"التقارير"}),(0,b.jsx)("p",{className:m.default.subtitle,children:"إنشاء وتصدير تقارير الأداء والحضور"})]})}),(0,b.jsx)("div",{className:m.default.reportTypes,children:z.map(a=>(0,b.jsxs)("button",{className:`${m.default.reportTypeCard} ${p===a.id?m.default.selected:""}`,onClick:()=>q(a.id),children:[(0,b.jsx)("div",{className:m.default.reportTypeIcon,children:a.icon}),(0,b.jsxs)("div",{className:m.default.reportTypeInfo,children:[(0,b.jsx)("h3",{children:a.label}),(0,b.jsx)("p",{children:a.description})]})]},a.id))}),(0,b.jsxs)("div",{className:m.default.filtersCard,children:[(0,b.jsxs)("h2",{className:m.default.sectionTitle,children:[(0,b.jsx)(k.Filter,{size:18}),"خيارات التقرير"]}),(0,b.jsxs)("div",{className:m.default.filtersGrid,children:[(0,b.jsxs)("div",{className:m.default.filterGroup,children:[(0,b.jsxs)("label",{children:[(0,b.jsx)(g.Calendar,{size:16}),"من تاريخ"]}),(0,b.jsx)("input",{type:"date",value:t,onChange:a=>u(a.target.value)})]}),(0,b.jsxs)("div",{className:m.default.filterGroup,children:[(0,b.jsxs)("label",{children:[(0,b.jsx)(g.Calendar,{size:16}),"إلى تاريخ"]}),(0,b.jsx)("input",{type:"date",value:v,onChange:a=>w(a.target.value)})]}),(0,b.jsxs)("div",{className:m.default.filterGroup,children:[(0,b.jsxs)("label",{children:[(0,b.jsx)(h.Users,{size:16}),"المدرس"]}),(0,b.jsxs)("select",{value:r,onChange:a=>s(a.target.value),children:[(0,b.jsx)("option",{value:"",children:"جميع المدرسين"}),a.map(a=>(0,b.jsx)("option",{value:a.id,children:a.name},a.id))]})]})]})]}),(0,b.jsxs)("div",{className:m.default.exportCard,children:[(0,b.jsxs)("h2",{className:m.default.sectionTitle,children:[(0,b.jsx)(f,{size:18}),"تصدير التقرير"]}),(0,b.jsxs)("div",{className:m.default.exportButtons,children:[(0,b.jsxs)("button",{className:`${m.default.exportBtn} ${m.default.pdfBtn}`,onClick:()=>y("pdf"),disabled:n,children:[(0,b.jsx)(d.FileText,{size:20}),(0,b.jsxs)("div",{children:[(0,b.jsx)("span",{children:"تصدير PDF"}),(0,b.jsx)("small",{children:"مستند قابل للطباعة"})]})]}),(0,b.jsxs)("button",{className:`${m.default.exportBtn} ${m.default.excelBtn}`,onClick:()=>y("excel"),disabled:n,children:[(0,b.jsx)(l,{size:20}),(0,b.jsxs)("div",{children:[(0,b.jsx)("span",{children:"تصدير Excel"}),(0,b.jsx)("small",{children:"جدول بيانات للتحليل"})]})]})]}),n&&(0,b.jsxs)("div",{className:m.default.loadingOverlay,children:[(0,b.jsx)("div",{className:m.default.loader}),(0,b.jsx)("p",{children:"جاري إنشاء التقرير..."})]})]})]})}a.s(["default",()=>n],76138)}];

//# sourceMappingURL=_5043a43b._.js.map
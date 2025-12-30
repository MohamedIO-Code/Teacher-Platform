(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,87316,e=>{"use strict";let t=(0,e.i(75254).default)("calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);e.s(["Calendar",()=>t],87316)},87130,e=>{"use strict";let t=(0,e.i(75254).default)("funnel",[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]]);e.s(["Filter",()=>t],87130)},72556,e=>{e.v({container:"reports-module__u2SaAW__container",excelBtn:"reports-module__u2SaAW__excelBtn",exportBtn:"reports-module__u2SaAW__exportBtn",exportButtons:"reports-module__u2SaAW__exportButtons",exportCard:"reports-module__u2SaAW__exportCard",filterGroup:"reports-module__u2SaAW__filterGroup",filtersCard:"reports-module__u2SaAW__filtersCard",filtersGrid:"reports-module__u2SaAW__filtersGrid",header:"reports-module__u2SaAW__header",loader:"reports-module__u2SaAW__loader",loadingOverlay:"reports-module__u2SaAW__loadingOverlay",pdfBtn:"reports-module__u2SaAW__pdfBtn",reportTypeCard:"reports-module__u2SaAW__reportTypeCard",reportTypeIcon:"reports-module__u2SaAW__reportTypeIcon",reportTypeInfo:"reports-module__u2SaAW__reportTypeInfo",reportTypes:"reports-module__u2SaAW__reportTypes",sectionTitle:"reports-module__u2SaAW__sectionTitle",selected:"reports-module__u2SaAW__selected",spin:"reports-module__u2SaAW__spin",subtitle:"reports-module__u2SaAW__subtitle",title:"reports-module__u2SaAW__title"})},67980,e=>{"use strict";var t=e.i(43476),a=e.i(71645),r=e.i(78583),l=e.i(75254);let s=(0,l.default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);var d=e.i(87316),i=e.i(61911),o=e.i(70273),n=e.i(54385),p=e.i(87130);let c=(0,l.default)("file-spreadsheet",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]]);var u=e.i(72556);function h(){let[e,l]=(0,a.useState)([]),[h,x]=(0,a.useState)(!1),[m,f]=(0,a.useState)("summary"),[_,y]=(0,a.useState)(""),[j,b]=(0,a.useState)(new Date(new Date().setMonth(new Date().getMonth()-1)).toISOString().split("T")[0]),[v,g]=(0,a.useState)(new Date().toISOString().split("T")[0]);(0,a.useEffect)(()=>{w()},[]);let w=async()=>{try{let e=await fetch("/api/teachers?limit=100&status=active"),t=await e.json();l(t.teachers||[])}catch(e){console.error("Failed to fetch teachers:",e)}},S=async e=>{x(!0);try{let r=new URLSearchParams({type:m,format:e,startDate:j,endDate:v});_&&r.set("teacherId",_);let l=await fetch(`/api/reports?${r}`);if(!l.ok)throw Error("Failed to generate report");if("excel"===e){let e=await l.blob(),t=window.URL.createObjectURL(e),a=document.createElement("a");a.href=t,a.download=`report-${m}-${new Date().toISOString().split("T")[0]}.xlsx`,document.body.appendChild(a),a.click(),window.URL.revokeObjectURL(t),document.body.removeChild(a)}else{let e=await l.json();if(e.success&&e.data){var t,a;let r,l,s,d;t=e.data,a={type:m,startDate:j,endDate:v},r="attendance"===a.type?"تقرير الحضور والانصراف":"evaluations"===a.type?"تقرير التقييمات":"التقرير الشامل",l=t.length>0?Object.keys(t[0]):[],s=`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>${r}</title>
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
        <h1>${r}</h1>
        <p>الفترة: من ${a.startDate||"-"} إلى ${a.endDate||"-"}</p>
        <p>تاريخ الإنشاء: ${new Date().toLocaleDateString("ar-SA")}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                ${l.map(e=>`<th>${e}</th>`).join("")}
            </tr>
        </thead>
        <tbody>
            ${t.map(e=>`
                <tr>
                    ${l.map(t=>`<td>${e[t]??"-"}</td>`).join("")}
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
</html>`,(d=window.open("","_blank"))&&(d.document.write(s),d.document.close())}else throw Error(e.error||"Failed to generate report")}}catch(e){console.error("Failed to generate report:",e),alert("حدث خطأ في إنشاء التقرير")}finally{x(!1)}},k=[{id:"summary",label:"تقرير شامل",icon:(0,t.jsx)(r.FileText,{size:24}),description:"ملخص شامل للأداء والحضور والتقييمات"},{id:"attendance",label:"تقرير الحضور",icon:(0,t.jsx)(n.ClipboardCheck,{size:24}),description:"تفاصيل سجل الحضور والانصراف"},{id:"evaluations",label:"تقرير التقييمات",icon:(0,t.jsx)(o.Star,{size:24}),description:"تفاصيل تقييمات الأداء"}];return(0,t.jsxs)("div",{className:u.default.container,children:[(0,t.jsx)("div",{className:u.default.header,children:(0,t.jsxs)("div",{children:[(0,t.jsx)("h1",{className:u.default.title,children:"التقارير"}),(0,t.jsx)("p",{className:u.default.subtitle,children:"إنشاء وتصدير تقارير الأداء والحضور"})]})}),(0,t.jsx)("div",{className:u.default.reportTypes,children:k.map(e=>(0,t.jsxs)("button",{className:`${u.default.reportTypeCard} ${m===e.id?u.default.selected:""}`,onClick:()=>f(e.id),children:[(0,t.jsx)("div",{className:u.default.reportTypeIcon,children:e.icon}),(0,t.jsxs)("div",{className:u.default.reportTypeInfo,children:[(0,t.jsx)("h3",{children:e.label}),(0,t.jsx)("p",{children:e.description})]})]},e.id))}),(0,t.jsxs)("div",{className:u.default.filtersCard,children:[(0,t.jsxs)("h2",{className:u.default.sectionTitle,children:[(0,t.jsx)(p.Filter,{size:18}),"خيارات التقرير"]}),(0,t.jsxs)("div",{className:u.default.filtersGrid,children:[(0,t.jsxs)("div",{className:u.default.filterGroup,children:[(0,t.jsxs)("label",{children:[(0,t.jsx)(d.Calendar,{size:16}),"من تاريخ"]}),(0,t.jsx)("input",{type:"date",value:j,onChange:e=>b(e.target.value)})]}),(0,t.jsxs)("div",{className:u.default.filterGroup,children:[(0,t.jsxs)("label",{children:[(0,t.jsx)(d.Calendar,{size:16}),"إلى تاريخ"]}),(0,t.jsx)("input",{type:"date",value:v,onChange:e=>g(e.target.value)})]}),(0,t.jsxs)("div",{className:u.default.filterGroup,children:[(0,t.jsxs)("label",{children:[(0,t.jsx)(i.Users,{size:16}),"المدرس"]}),(0,t.jsxs)("select",{value:_,onChange:e=>y(e.target.value),children:[(0,t.jsx)("option",{value:"",children:"جميع المدرسين"}),e.map(e=>(0,t.jsx)("option",{value:e.id,children:e.name},e.id))]})]})]})]}),(0,t.jsxs)("div",{className:u.default.exportCard,children:[(0,t.jsxs)("h2",{className:u.default.sectionTitle,children:[(0,t.jsx)(s,{size:18}),"تصدير التقرير"]}),(0,t.jsxs)("div",{className:u.default.exportButtons,children:[(0,t.jsxs)("button",{className:`${u.default.exportBtn} ${u.default.pdfBtn}`,onClick:()=>S("pdf"),disabled:h,children:[(0,t.jsx)(r.FileText,{size:20}),(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{children:"تصدير PDF"}),(0,t.jsx)("small",{children:"مستند قابل للطباعة"})]})]}),(0,t.jsxs)("button",{className:`${u.default.exportBtn} ${u.default.excelBtn}`,onClick:()=>S("excel"),disabled:h,children:[(0,t.jsx)(c,{size:20}),(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{children:"تصدير Excel"}),(0,t.jsx)("small",{children:"جدول بيانات للتحليل"})]})]})]}),h&&(0,t.jsxs)("div",{className:u.default.loadingOverlay,children:[(0,t.jsx)("div",{className:u.default.loader}),(0,t.jsx)("p",{children:"جاري إنشاء التقرير..."})]})]})]})}e.s(["default",()=>h],67980)}]);
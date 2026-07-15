// A4 dimensions and auto-fit logic
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
let renderFitToken = 0;

function applyA4AutoFit(printArea) {
    const inner = printArea.querySelector('.a4-inner');
    if (!inner) return;

    inner.style.transform = 'none';
    inner.style.width = `${A4_WIDTH_PX}px`;
    inner.style.height = `${A4_HEIGHT_PX}px`;
    inner.style.minHeight = `${A4_HEIGHT_PX}px`;

    const containerHeight = printArea.clientHeight || A4_HEIGHT_PX;
    const contentHeight = inner.scrollHeight;

    if (!containerHeight || !contentHeight) return;

    if (contentHeight > containerHeight) {
        const scaleFactor = containerHeight / contentHeight;
        const fittedWidth = A4_WIDTH_PX / scaleFactor;
        const fittedHeight = containerHeight / scaleFactor;
        inner.style.width = `${fittedWidth}px`;
        inner.style.height = `${fittedHeight}px`;
        inner.style.minHeight = `${fittedHeight}px`;
        inner.style.transform = `scale(${scaleFactor})`;
        inner.dataset.fitScale = scaleFactor.toFixed(6);
        console.log(`[Auto-fit] Content ${contentHeight}px > A4 ${containerHeight}px -> scale(${scaleFactor.toFixed(3)})`);
    } else {
        inner.dataset.fitScale = '1';
    }
}

async function settleAndApplyA4AutoFit(printArea, token = null) {
    if (document.fonts?.ready) {
        await document.fonts.ready;
    }
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    if (token !== null && token !== renderFitToken) return;

    applyA4AutoFit(printArea);
    await new Promise(requestAnimationFrame);

    const overflow = printArea.scrollHeight - printArea.clientHeight;
    if (overflow > 1) {
        applyA4AutoFit(printArea);
    }
}

        function renderResumeData(currentResumeData, printArea) {
            if (!currentResumeData) return;

            if (!printArea) printArea = document.getElementById('resume-print-area');
            const styling = currentResumeData.styling || {};
            const tpl = styling.template || 'modern-slate';
            const primaryColor = styling.primary_color || '#10b981';
            
            // Helper to check visibility
            const isVis = (field) => {
                if (!currentResumeData.visibility) return true;
                return currentResumeData.visibility[field] !== false;
            };

            // Set Font Family
            const fontMap = {
                'Prompt': "'Prompt', sans-serif",
                'Sarabun': "'Sarabun', sans-serif",
                'Noto Sans Thai': "'Noto Sans Thai', sans-serif",
                'Inter': "'Inter', sans-serif",
                'Lora': "'Lora', serif",
                'Playfair Display': "'Playfair Display', serif"
            };
            printArea.style.fontFamily = fontMap[styling.font_family || 'Prompt'];

            // Set Margin Spacing
            const marginMap = {
                'compact': 'p-4 gap-3',
                'normal': 'p-8 gap-6',
                'spacious': 'p-12 gap-8'
            };
            const paddingClass = marginMap[styling.margins || 'normal'];

            // Set Font Size Factor
            const sizeMap = {
                'small': 'text-[12px] leading-relaxed',
                'medium': 'text-[14px] leading-relaxed',
                'large': 'text-[16px] leading-relaxed'
            };
            const baseTextSize = sizeMap[styling.font_size || 'medium'];

            // Clean lists
            const name = (currentResumeData.name || '').toUpperCase();
            const jobTitle = currentResumeData.job_title || '';
            const summary = currentResumeData.summary || '';
            const phone = currentResumeData.contact?.phone || '';
            const email = currentResumeData.contact?.email || '';
            const address = currentResumeData.contact?.address || '';
            const linkedin = currentResumeData.contact?.linkedin || '';
            const website = currentResumeData.contact?.website || '';
            
            const experience = currentResumeData.experience || [];
            const education = currentResumeData.education || [];
            const skills = currentResumeData.skills || [];

            // Image Source
            let profilePicHtml = '';
            if (isVis('profile_image')) {
                if (currentResumeData.profile_image) {
                    profilePicHtml = `<img src="uploads/${currentResumeData.profile_image}" class="w-full h-full object-cover rounded-full">`;
                } else {
                    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
                    profilePicHtml = `
                        <div class="w-full h-full rounded-full flex items-center justify-center font-bold text-white text-3xl" style="background-color: ${primaryColor}">
                            ${initials || 'AN'}
                        </div>
                    `;
                }
            }

            // HTML variables
            let htmlContent = '';

            // Helper: Render Contact list items
            const renderContactItem = (field, icon, label, value) => {
                if (!value || !isVis(field)) return '';
                return `
                    <li class="flex flex-col">
                        <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                            <i class="${icon}"></i> ${label}
                        </span>
                        <span class="font-medium text-white break-words text-xs mt-0.5">${value}</span>
                    </li>
                `;
            };

            const renderContactItemLight = (field, icon, value) => {
                if (!value || !isVis(field)) return '';
                return `
                    <span class="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-md break-words min-w-0">
                        <i class="${icon}" style="color: ${primaryColor}"></i>
                        <span class="break-words min-w-0">${value}</span>
                    </span>
                `;
            };

            if (tpl === 'modern-slate') {
                // ================= TEMPLATE: MODERN SLATE =================
                let experienceHtml = '';
                experience.forEach(exp => {
                    let descHtml = '';
                    if (exp.details && exp.details.length > 0) {
                        descHtml = `<div class="mt-1.5 space-y-1 text-slate-600">`;
                        exp.details.forEach(det => {
                            if (det.trim() !== '') {
                                descHtml += `
                                    <div class="flex items-start gap-1.5">
                                        <span class="text-slate-400 select-none">•</span>
                                        <span class="break-words">${det}</span>
                                    </div>
                                `;
                            }
                        });
                        descHtml += `</div>`;
                    }

                    experienceHtml += `
                        <div class="mb-4 min-w-0">
                            <table style="width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 2px;">
                                <tr>
                                    <td style="vertical-align: top; text-align: left; padding: 0;">
                                        <h3 class="text-sm font-bold text-slate-900 break-words">${exp.job_title}</h3>
                                    </td>
                                    <td style="vertical-align: top; text-align: right; width: 135px; padding: 0;">
                                        <span class="resume-period resume-period-badge inline-flex items-center justify-center text-[10px] font-semibold px-2 rounded break-words whitespace-nowrap" style="color: ${primaryColor}; background-color: ${primaryColor}15; line-height: 1.2; padding: 4px 8px; display: inline-block;">${exp.period}</span>
                                    </td>
                                </tr>
                            </table>
                            <p class="text-[11px] font-semibold text-slate-500 italic break-words min-w-0">${exp.company}</p>
                            ${descHtml}
                        </div>
                    `;
                });

                let educationHtml = '';
                education.forEach(edu => {
                    educationHtml += `
                        <div class="mb-3.5">
                            <span class="text-[10px] font-bold" style="color: ${primaryColor}">${edu.period}</span>
                            <h3 class="font-bold text-white text-xs leading-tight">${edu.degree}</h3>
                            <p class="text-[10px] text-slate-400 mt-0.5">${edu.institution}</p>
                            ${edu.gpax ? `<p class="text-[9px] text-slate-400 mt-0.5">GPAX: <span class="text-white font-semibold">${edu.gpax}</span></p>` : ''}
                        </div>
                    `;
                });

                let skillsHtml = '';
                skills.forEach(sk => {
                    skillsHtml += `
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: fixed;">
                            <tr>
                                <td style="vertical-align: top; width: 3px; padding: 0;">
                                    <div style="width: 3px; height: 11px; border-radius: 2px; background-color: ${primaryColor}; margin-top: 3.5px; display: block;"></div>
                                </td>
                                <td style="vertical-align: top; padding: 0 0 0 11px; text-align: left;">
                                    <span class="font-bold text-white text-xs break-words">${sk.category}:</span>
                                    <span class="text-[11px] text-slate-300 break-words">${sk.items}</span>
                                </td>
                            </tr>
                        </table>
                    `;
                });

                htmlContent = `
                    <div class="flex min-h-[297mm] h-full ${baseTextSize} w-full">
                        <!-- Sidebar (33.33%) -->
                        <div class="w-[33.333%] shrink-0 bg-slate-900 text-white p-6 flex flex-col justify-between min-w-0">
                            <div class="w-full min-w-0">
                                <!-- Image -->
                                ${isVis('profile_image') ? `
                                <div class="mb-6 text-center">
                                    <div class="w-28 h-28 mx-auto border-4 border-slate-800 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                                        ${profilePicHtml}
                                    </div>
                                </div>` : ''}

                                <!-- Contact Section -->
                                ${((phone && isVis('phone')) || (email && isVis('email')) || (address && isVis('address')) || (linkedin && isVis('linkedin')) || (website && isVis('website'))) ? `
                                <div class="mb-6">
                                    <h2 class="resume-section-heading text-[11px] font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-1" style="color: ${primaryColor}">Contact</h2>
                                    <ul class="space-y-2.5">
                                        ${renderContactItem('phone', 'fa-solid fa-phone', 'Phone', phone)}
                                        ${renderContactItem('email', 'fa-solid fa-envelope', 'Email', email)}
                                        ${renderContactItem('address', 'fa-solid fa-map-location-dot', 'Address', address)}
                                        ${renderContactItem('linkedin', 'fa-brands fa-linkedin-in', 'LinkedIn', linkedin)}
                                        ${renderContactItem('website', 'fa-solid fa-globe', 'Website', website)}
                                    </ul>
                                </div>` : ''}

                                <!-- Education Section -->
                                ${education.length > 0 && isVis('education') ? `
                                <div class="mb-6">
                                    <h2 class="resume-section-heading text-[11px] font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-1" style="color: ${primaryColor}">Education</h2>
                                    <div class="space-y-1">
                                        ${educationHtml}
                                    </div>
                                </div>` : ''}

                                <!-- Skills Section -->
                                ${skills.length > 0 && isVis('skills') ? `
                                <div>
                                    <h2 class="resume-section-heading text-[11px] font-bold uppercase tracking-widest mb-3 border-b border-slate-800 pb-1" style="color: ${primaryColor}">Skills</h2>
                                    <div class="space-y-1">
                                        ${skillsHtml}
                                    </div>
                                </div>` : ''}
                            </div>
                        </div>

                        <!-- Main Content (66.67%) -->
                        <div class="w-[66.667%] shrink-0 bg-white ${paddingClass} flex flex-col justify-between min-w-0">
                            <div class="w-full min-w-0">
                                <!-- Name and Job title -->
                                <div class="mb-5 border-b-2 border-slate-100 pb-4">
                                    <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight leading-none break-words">${name}</h1>
                                    ${isVis('job_title') && jobTitle ? `<p class="text-xs font-bold tracking-wider uppercase mt-1.5 break-words" style="color: ${primaryColor}">${jobTitle}</p>` : ''}
                                </div>

                                <!-- Summary -->
                                ${summary && isVis('summary') ? `
                                <div class="mb-5">
                                    <h2 class="resume-section-heading text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 pb-1 border-b border-slate-100">Professional Summary</h2>
                                    <p class="text-slate-600 text-justify leading-relaxed break-words">${summary}</p>
                                </div>` : ''}

                                <!-- Experience -->
                                ${experience.length > 0 && isVis('experience') ? `
                                <div class="mb-5">
                                    <h2 class="resume-section-heading text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 pb-1 border-b border-slate-100">Work Experience</h2>
                                    <div class="space-y-4">
                                        ${experienceHtml}
                                    </div>
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                `;

            } else if (tpl === 'ivory-minimal') {
                // ================= TEMPLATE: IVORY MINIMALIST =================
                let experienceHtml = '';
                experience.forEach(exp => {
                    let descHtml = '';
                    if (exp.details && exp.details.length > 0) {
                        descHtml = `<div class="mt-1 text-slate-600 space-y-0.5">`;
                        exp.details.forEach(det => {
                            if (det.trim() !== '') {
                                descHtml += `
                                    <div class="flex items-start gap-1.5">
                                        <span class="text-slate-400 select-none">•</span>
                                        <span class="break-words">${det}</span>
                                    </div>
                                `;
                            }
                        });
                        descHtml += `</div>`;
                    }

                    experienceHtml += `
                        <div class="mb-4 text-xs">
                            <div class="flex justify-between items-baseline mb-0.5">
                                <div class="min-w-0">
                                    <span class="font-bold text-slate-900 text-sm break-words">${exp.job_title}</span>
                                    <span class="text-slate-400 mx-1">|</span>
                                    <span class="text-slate-600 italic font-medium break-words">${exp.company}</span>
                                </div>
                                <span class="resume-period shrink-0 font-semibold text-slate-500 ml-4">${exp.period}</span>
                            </div>
                            ${descHtml}
                        </div>
                    `;
                });

                let educationHtml = '';
                education.forEach(edu => {
                    educationHtml += `
                        <div class="text-xs mb-2">
                            <div class="flex justify-between items-baseline mb-0.5">
                                <div class="min-w-0">
                                    <span class="font-bold text-slate-900 break-words">${edu.degree}</span>
                                    <span class="text-slate-400 mx-1">|</span>
                                    <span class="text-slate-600 break-words">${edu.institution}</span>
                                    ${edu.gpax ? `<span class="text-slate-400 mx-1.5">-</span><span class="text-[10px] text-slate-500 break-words">GPAX: ${edu.gpax}</span>` : ''}
                                </div>
                                <span class="shrink-0 font-semibold text-slate-500 ml-4">${edu.period}</span>
                            </div>
                        </div>
                    `;
                });

                let skillsHtml = '';
                skills.forEach(sk => {
                    skillsHtml += `
                        <div class="text-xs mb-1.5 flex gap-2 flex-wrap">
                            <span class="font-bold text-slate-900 min-w-[120px] shrink-0 break-words">${sk.category}:</span>
                            <span class="text-slate-600 break-words">${sk.items}</span>
                        </div>
                    `;
                });

                htmlContent = `
                    <div class="min-h-[297mm] h-full ${paddingClass} ${baseTextSize} bg-[#fafaf9] flex flex-col justify-between max-w-full">
                        <div class="max-w-full">
                            <!-- Header (Centered) -->
                            <div class="text-center mb-6">
                                <h1 class="text-3xl font-bold tracking-tight text-slate-900 break-words" style="font-family: 'Playfair Display', serif;">${name}</h1>
                                ${isVis('job_title') && jobTitle ? `<p class="text-xs font-semibold tracking-widest uppercase mt-2 text-slate-500 break-words" style="letter-spacing: 0.15em; color: ${primaryColor}">${jobTitle}</p>` : ''}
                                
                                <!-- Contact Row -->
                                ${((phone && isVis('phone')) || (email && isVis('email')) || (address && isVis('address')) || (linkedin && isVis('linkedin')) || (website && isVis('website'))) ? `
                                <div class="flex flex-wrap justify-center gap-3 mt-3">
                                    ${renderContactItemLight('phone', 'fa-solid fa-phone', phone)}
                                    ${renderContactItemLight('email', 'fa-solid fa-envelope', email)}
                                    ${renderContactItemLight('address', 'fa-solid fa-map-location-dot', address)}
                                    ${renderContactItemLight('linkedin', 'fa-brands fa-linkedin-in', linkedin)}
                                    ${renderContactItemLight('website', 'fa-solid fa-globe', website)}
                                </div>` : ''}
                            </div>

                            <!-- Summary -->
                            ${summary && isVis('summary') ? `
                            <div class="mb-5">
                                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-300 break-words" style="font-family: 'Playfair Display', serif;">Professional Summary</h2>
                                <p class="text-slate-600 text-justify mt-2 leading-relaxed text-xs break-words">${summary}</p>
                            </div>` : ''}

                            <!-- Work Experience -->
                            ${experience.length > 0 && isVis('experience') ? `
                            <div class="mb-5">
                                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-300 break-words" style="font-family: 'Playfair Display', serif;">Work Experience</h2>
                                <div class="space-y-3 mt-2">
                                    ${experienceHtml}
                                </div>
                            </div>` : ''}

                            <!-- Education -->
                            ${education.length > 0 && isVis('education') ? `
                            <div class="mb-5">
                                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-300 break-words" style="font-family: 'Playfair Display', serif;">Education</h2>
                                <div class="space-y-1 mt-2">
                                    ${educationHtml}
                                </div>
                            </div>` : ''}

                            <!-- Skills -->
                            ${skills.length > 0 && isVis('skills') ? `
                            <div class="mb-5">
                                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-300 break-words" style="font-family: 'Playfair Display', serif;">Skills</h2>
                                <div class="space-y-1 mt-2">
                                    ${skillsHtml}
                                </div>
                            </div>` : ''}
                        </div>
                    </div>
                `;

            } else if (tpl === 'tech-emerald') {
                // ================= TEMPLATE: TECH EMERALD =================
                let experienceHtml = '';
                experience.forEach((exp, idx) => {
                    let descHtml = '';
                    if (exp.details && exp.details.length > 0) {
                        descHtml = `<div class="mt-1.5 space-y-1 text-slate-600 text-xs">`;
                        exp.details.forEach(det => {
                            if (det.trim() !== '') {
                                descHtml += `
                                    <div class="flex items-start gap-1.5">
                                        <span class="text-slate-400 select-none">•</span>
                                        <span class="break-words">${det}</span>
                                    </div>
                                `;
                            }
                        });
                        descHtml += `</div>`;
                    }

                    experienceHtml += `
                        <div class="mb-4 relative pl-5 ${idx !== experience.length - 1 ? 'border-l-2 border-slate-100' : ''}">
                            <div class="absolute -left-[6px] top-1 w-[10px] h-[10px] rounded-full bg-white border-2" style="border-color: ${primaryColor}"></div>
                            <div class="flex justify-between items-baseline mb-0.5">
                                <h3 class="text-xs font-bold text-slate-900 break-words">${exp.job_title}</h3>
                                <span class="resume-period shrink-0 text-[10px] font-semibold text-slate-400 ml-4">${exp.period}</span>
                            </div>
                            <p class="text-[10px] font-bold text-slate-400 italic break-words">${exp.company}</p>
                            ${descHtml}
                        </div>
                    `;
                });

                let educationHtml = '';
                education.forEach(edu => {
                    educationHtml += `
                        <div class="mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <span class="text-[9px] font-bold text-slate-400">${edu.period}</span>
                            <h3 class="font-bold text-slate-800 text-[11px] mt-0.5 leading-tight">${edu.degree}</h3>
                            <p class="text-[10px] text-slate-500">${edu.institution}</p>
                            ${edu.gpax ? `<p class="text-[9px] text-slate-500 font-medium mt-0.5">GPAX: ${edu.gpax}</p>` : ''}
                        </div>
                    `;
                });

                let skillsHtml = '';
                skills.forEach(sk => {
                    const tagBadges = sk.items.split(',').map(tag => {
                        return `<span class="inline-block text-[9px] font-medium bg-slate-100 text-slate-700 px-2 rounded border border-slate-200 text-center break-words" style="line-height: 1.2; padding: 4px 6px; vertical-align: middle;">${tag.trim()}</span>`;
                    }).join(' ');

                    skillsHtml += `
                        <div class="mb-3">
                            <span class="font-bold block text-slate-800 text-[11px] mb-1.5 break-words">${sk.category}</span>
                            <div class="flex flex-wrap gap-1">
                                ${tagBadges}
                            </div>
                        </div>
                    `;
                });

                htmlContent = `
                    <div class="min-h-[297mm] h-full ${baseTextSize} bg-white flex flex-col justify-between max-w-full">
                        <div class="max-w-full">
                            <!-- Header with accent bar -->
                            <div class="bg-slate-900 text-white p-6 flex justify-between items-center relative overflow-hidden">
                                <div class="absolute inset-0 bg-gradient-to-r opacity-20" style="background-image: linear-gradient(135deg, ${primaryColor} 0%, transparent 100%)"></div>
                                <div class="relative z-10 max-w-full">
                                    <h1 class="text-2xl font-extrabold tracking-tight text-white break-words">${name}</h1>
                                    ${isVis('job_title') && jobTitle ? `<p class="text-xs font-semibold uppercase tracking-wider mt-1.5 break-words" style="color: ${primaryColor}">${jobTitle}</p>` : ''}
                                    
                                    <!-- Contact details simple row -->
                                    <div class="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[10px] text-slate-300">
                                        ${phone && isVis('phone') ? `<span class="break-words"><i class="fa-solid fa-phone mr-1"></i> ${phone}</span>` : ''}
                                        ${email && isVis('email') ? `<span class="break-words"><i class="fa-solid fa-envelope mr-1"></i> ${email}</span>` : ''}
                                        ${address && isVis('address') ? `<span class="break-words"><i class="fa-solid fa-map-pin mr-1"></i> ${address}</span>` : ''}
                                    </div>
                                </div>
                                ${isVis('profile_image') ? `
                                <div class="w-20 h-20 border-2 border-slate-800 rounded-full overflow-hidden shrink-0 shadow-lg relative z-10">
                                    ${profilePicHtml}
                                </div>` : ''}
                            </div>

                            <!-- Dual columns body -->
                            <div class="flex ${paddingClass} w-full min-w-0">
                                <!-- Main column (66.67%) -->
                                <div class="w-[66.667%] shrink-0 pr-6 min-w-0">
                                    <!-- Summary -->
                                    ${summary && isVis('summary') ? `
                                    <div class="mb-5">
                                        <h2 class="text-xs font-extrabold uppercase tracking-wider mb-2.5 pb-1 border-b-2 break-words" style="color: ${primaryColor}; border-color: ${primaryColor}20">Summary</h2>
                                        <p class="text-slate-600 text-justify text-xs leading-relaxed break-words">${summary}</p>
                                    </div>` : ''}

                                    <!-- Experience -->
                                    ${experience.length > 0 && isVis('experience') ? `
                                    <div class="mb-5">
                                        <h2 class="text-xs font-extrabold uppercase tracking-wider mb-3 pb-1 border-b-2 break-words" style="color: ${primaryColor}; border-color: ${primaryColor}20">Experience</h2>
                                        <div class="space-y-1">
                                            ${experienceHtml}
                                        </div>
                                    </div>` : ''}
                                </div>

                                <!-- Sidebar column (33.33%) -->
                                <div class="w-[33.333%] shrink-0 border-l border-slate-100 pl-5 min-w-0">
                                    <!-- Social Links -->
                                    ${((linkedin && isVis('linkedin')) || (website && isVis('website'))) ? `
                                    <div class="mb-5">
                                        <h2 class="text-xs font-extrabold uppercase tracking-wider mb-2.5 pb-1 border-b-2 break-words" style="color: ${primaryColor}; border-color: ${primaryColor}20">Links</h2>
                                        <ul class="space-y-2 text-[10px] text-slate-600">
                                            ${linkedin && isVis('linkedin') ? `<li><i class="fa-brands fa-linkedin mr-1.5"></i> <span class="break-words font-semibold">${linkedin.replace('https://', '')}</span></li>` : ''}
                                            ${website && isVis('website') ? `<li><i class="fa-solid fa-globe mr-1.5"></i> <span class="break-words font-semibold">${website.replace('https://', '')}</span></li>` : ''}
                                        </ul>
                                    </div>` : ''}

                                    <!-- Education -->
                                    ${education.length > 0 && isVis('education') ? `
                                    <div class="mb-5">
                                        <h2 class="text-xs font-extrabold uppercase tracking-wider mb-2.5 pb-1 border-b-2 break-words" style="color: ${primaryColor}; border-color: ${primaryColor}20">Education</h2>
                                        <div class="space-y-1">
                                            ${educationHtml}
                                        </div>
                                    </div>` : ''}

                                    <!-- Skills -->
                                    ${skills.length > 0 && isVis('skills') ? `
                                    <div class="mb-5">
                                        <h2 class="text-xs font-extrabold uppercase tracking-wider mb-2.5 pb-1 border-b-2 break-words" style="color: ${primaryColor}; border-color: ${primaryColor}20">Skills</h2>
                                        <div class="space-y-1">
                                            ${skillsHtml}
                                        </div>
                                    </div>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

            } else if (tpl === 'creative-lavender') {
                // ================= TEMPLATE: CREATIVE LAVENDER =================
                let experienceHtml = '';
                experience.forEach(exp => {
                    let descHtml = '';
                    if (exp.details && exp.details.length > 0) {
                        descHtml = `<div class="mt-1.5 space-y-1 text-slate-600 text-xs">`;
                        exp.details.forEach(det => {
                            if (det.trim() !== '') {
                                descHtml += `
                                    <div class="flex items-start gap-1.5">
                                        <span class="text-slate-400 select-none">•</span>
                                        <span class="break-words">${det}</span>
                                    </div>
                                `;
                            }
                        });
                        descHtml += `</div>`;
                    }

                    experienceHtml += `
                        <div class="mb-4 min-w-0">
                            <div class="flex justify-between items-start gap-4 mb-0.5">
                                <h3 class="text-xs font-bold text-slate-800 break-words">${exp.job_title}</h3>
                                <span class="resume-period resume-period-badge shrink-0 text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full break-words">${exp.period}</span>
                            </div>
                            <p class="text-[10px] font-bold tracking-wide uppercase mt-0.5 break-words min-w-0" style="color: ${primaryColor}">${exp.company}</p>
                            ${descHtml}
                        </div>
                    `;
                });

                let educationHtml = '';
                education.forEach(edu => {
                    educationHtml += `
                        <div class="mb-3.5">
                            <span class="text-[9px] font-bold text-slate-400">${edu.period}</span>
                            <h3 class="font-bold text-slate-800 text-[11px] leading-tight mt-0.5">${edu.degree}</h3>
                            <p class="text-[10px] text-slate-500">${edu.institution}</p>
                            ${edu.gpax ? `<p class="text-[9px] text-slate-400 mt-0.5">GPA: <span class="font-bold text-slate-600">${edu.gpax}</span></p>` : ''}
                        </div>
                    `;
                });

                let skillsHtml = '';
                skills.forEach(sk => {
                    skillsHtml += `
                        <div class="mb-3.5 w-[calc(50%-8px)] min-w-[120px] shrink-0">
                            <span class="font-bold block text-slate-700 text-[11px] mb-1.5 uppercase tracking-wide break-words">${sk.category}</span>
                            <p class="text-xs text-slate-500 pl-1 leading-relaxed break-words">${sk.items}</p>
                        </div>
                    `;
                });

                htmlContent = `
                    <div class="min-h-[297mm] h-full ${baseTextSize} bg-white flex flex-col justify-between relative max-w-full">
                        <!-- Top creative accent gradient line -->
                        <div class="h-2 w-full bg-gradient-to-r" style="background-image: linear-gradient(to right, ${primaryColor}, #8b5cf6)"></div>
                        
                        <div class="flex flex-grow ${paddingClass} w-full min-w-0">
                            <!-- Left Sidebar (33.33%) -->
                            <div class="w-[33.333%] shrink-0 pr-5 border-r border-slate-100 flex flex-col gap-6 min-w-0">
                                <!-- Photo & Title -->
                                <div class="text-center max-w-full">
                                    ${isVis('profile_image') ? `
                                    <div class="w-24 h-24 mx-auto rounded-full ring-4 ring-offset-2 overflow-hidden shadow-md" style="ring-color: ${primaryColor}">
                                        ${profilePicHtml}
                                    </div>` : ''}
                                    <h2 class="text-base font-bold text-slate-900 mt-4 leading-tight break-words">${name}</h2>
                                    ${isVis('job_title') && jobTitle ? `<p class="text-[10px] font-bold uppercase tracking-wider mt-1 break-words" style="color: ${primaryColor}">${jobTitle}</p>` : ''}
                                </div>

                                <!-- Contact Info -->
                                ${((phone && isVis('phone')) || (email && isVis('email')) || (linkedin && isVis('linkedin')) || (website && isVis('website')) || (address && isVis('address'))) ? `
                                <div>
                                    <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 border-b pb-1 break-words">Info</h3>
                                    <ul class="space-y-3.5 text-xs text-slate-600">
                                        ${phone && isVis('phone') ? `<li class="flex gap-2"><i class="fa-solid fa-phone text-slate-400 mt-0.5"></i> <span class="break-words">${phone}</span></li>` : ''}
                                        ${email && isVis('email') ? `<li class="flex gap-2"><i class="fa-solid fa-envelope text-slate-400 mt-0.5"></i> <span class="break-words">${email}</span></li>` : ''}
                                        ${linkedin && isVis('linkedin') ? `<li class="flex gap-2"><i class="fa-brands fa-linkedin text-slate-400 mt-0.5"></i> <span class="break-words">${linkedin.replace('https://', '')}</span></li>` : ''}
                                        ${website && isVis('website') ? `<li class="flex gap-2"><i class="fa-solid fa-globe text-slate-400 mt-0.5"></i> <span class="break-words">${website.replace('https://', '')}</span></li>` : ''}
                                        ${address && isVis('address') ? `<li class="flex gap-2"><i class="fa-solid fa-location-dot text-slate-400 mt-0.5"></i> <span class="leading-tight break-words">${address}</span></li>` : ''}
                                    </ul>
                                </div>` : ''}

                                <!-- Education -->
                                ${education.length > 0 && isVis('education') ? `
                                <div>
                                    <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 border-b pb-1 break-words">Education</h3>
                                    <div>${educationHtml}</div>
                                </div>` : ''}
                            </div>

                            <!-- Right Content (66.67%) -->
                            <div class="w-[66.667%] shrink-0 pl-6 flex flex-col gap-6 min-w-0">
                                <!-- Summary -->
                                ${summary && isVis('summary') ? `
                                <div>
                                    <h3 class="text-[10px] font-bold uppercase tracking-widest mb-2.5 pb-1 border-b break-words" style="color: ${primaryColor}; border-color: ${primaryColor}20">Summary</h3>
                                    <p class="text-slate-600 text-justify text-xs leading-relaxed break-words">${summary}</p>
                                </div>` : ''}

                                <!-- Experience -->
                                ${experience.length > 0 && isVis('experience') ? `
                                <div>
                                    <h3 class="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1 border-b break-words" style="color: ${primaryColor}; border-color: ${primaryColor}20">Experience</h3>
                                    <div class="space-y-1">${experienceHtml}</div>
                                </div>` : ''}

                                <!-- Skills -->
                                ${skills.length > 0 && isVis('skills') ? `
                                <div>
                                    <h3 class="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1 border-b break-words" style="color: ${primaryColor}; border-color: ${primaryColor}20">Skills</h3>
                                    <div class="flex flex-wrap gap-x-4 gap-y-1 w-full">${skillsHtml}</div>
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }

            // Wrap content in auto-fit inner div
            printArea.innerHTML = `<div class="a4-inner">${htmlContent}</div>`;

            const fitToken = ++renderFitToken;
            return settleAndApplyA4AutoFit(printArea, fitToken);
        }


        // 12. Exporting Utilities (PDF & Canvas Image)
        // A4 at 96 DPI: 794×1123 px. We capture at 2x scale for quality.

        function triggerNativePrint() {
            window.print();
        }

        // Helper: Capture element inside a clean, isolated onscreen sandbox (hidden under Swal overlay)
        async function captureA4CanvasClean() {
            if (!printArea) printArea = document.getElementById('resume-print-area');
            const originalParent = printArea.parentElement;
            const originalSibling = printArea.nextSibling;

            const inner = printArea.querySelector('.a4-inner');

            // Store original styles to restore later
            const originals = {
                width: printArea.style.width,
                height: printArea.style.height,
                minHeight: printArea.style.minHeight,
                maxHeight: printArea.style.maxHeight,
                boxShadow: printArea.style.boxShadow,
                overflow: printArea.style.overflow,
                boxSizing: printArea.style.boxSizing,
                maxWidth: printArea.style.maxWidth
            };

            // Store original inner styles to restore later
            const innerOriginals = inner ? {
                transform: inner.style.transform,
                width: inner.style.width,
                height: inner.style.height,
                minHeight: inner.style.minHeight
            } : null;

            // First, run applyA4AutoFit to let it calculate the correct scaleFactor, fittedWidth, and fittedHeight
            if (inner) {
                // Temporarily force print area to A4 size to let auto-fit calculate correctly
                printArea.style.width = `${A4_WIDTH_PX}px`;
                printArea.style.height = `${A4_HEIGHT_PX}px`;
                printArea.style.minHeight = `${A4_HEIGHT_PX}px`;
                printArea.style.maxHeight = `${A4_HEIGHT_PX}px`;
                
                applyA4AutoFit(printArea);
            }

            // Read the scale factor and fitted dimensions
            const scaleFactor = inner && inner.dataset.fitScale ? parseFloat(inner.dataset.fitScale) : 1;
            const fittedWidth = inner ? (A4_WIDTH_PX / scaleFactor) : A4_WIDTH_PX;
            const fittedHeight = inner ? (A4_HEIGHT_PX / scaleFactor) : A4_HEIGHT_PX;

            // Reset only the scale transform to 'none' so html2canvas renders the layout at 100% natural size
            if (inner) {
                inner.style.transform = 'none';
            }

            // Wait for DOM to settle
            await new Promise(requestAnimationFrame);
            await new Promise(requestAnimationFrame);

            // Create sandbox container matched to the fitted (natural) dimensions
            const sandbox = document.createElement('div');
            sandbox.style.position = 'fixed';
            sandbox.style.left = '0';
            sandbox.style.top = '0';
            sandbox.style.width = `${fittedWidth}px`;
            sandbox.style.height = `${fittedHeight}px`;
            sandbox.style.overflow = 'hidden';
            sandbox.style.background = '#ffffff';
            sandbox.style.margin = '0';
            sandbox.style.padding = '0';
            sandbox.style.border = 'none';
            sandbox.style.zIndex = '999';

            // Force print area to match the fitted dimensions (no scaling, no clipping during html2canvas capture)
            printArea.style.width = `${fittedWidth}px`;
            printArea.style.height = `${fittedHeight}px`;
            printArea.style.minHeight = `${fittedHeight}px`;
            printArea.style.maxHeight = `${fittedHeight}px`;
            printArea.style.boxShadow = 'none';
            printArea.style.overflow = 'hidden';
            printArea.style.boxSizing = 'border-box';
            printArea.style.maxWidth = `${fittedWidth}px`;

            // Move element into the sandbox
            sandbox.appendChild(printArea);
            document.body.appendChild(sandbox);

            // Wait for all web fonts to be fully loaded and layout to settle
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }
            await new Promise(r => setTimeout(r, 100));

            try {
                // Perform the capture at 1:1 scale (the output canvas will be fittedWidth*2 by fittedHeight*2)
                const rawCanvas = await html2canvas(printArea, {
                    width: fittedWidth,
                    height: fittedHeight,
                    scale: 2, // 2x for high DPI sharp rendering
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    scrollX: 0,
                    scrollY: 0,
                    x: 0,
                    y: 0
                });

                // Scale the raw canvas down to A4 size (794x1123 px * 2 = 1588x2246 px) preserving aspect ratio perfectly
                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = A4_WIDTH_PX * 2;
                finalCanvas.height = A4_HEIGHT_PX * 2;
                const ctx = finalCanvas.getContext('2d');
                
                // Draw raw canvas onto final A4 canvas (browsers scale canvas smoothly and preserve alignment)
                ctx.drawImage(rawCanvas, 0, 0, finalCanvas.width, finalCanvas.height);

                return finalCanvas;
            } finally {
                // Restore original styles
                printArea.style.width = originals.width;
                printArea.style.height = originals.height;
                printArea.style.minHeight = originals.minHeight;
                printArea.style.maxHeight = originals.maxHeight;
                printArea.style.boxShadow = originals.boxShadow;
                printArea.style.overflow = originals.overflow;
                printArea.style.boxSizing = originals.boxSizing;
                printArea.style.maxWidth = originals.maxWidth;

                if (inner && innerOriginals) {
                    inner.style.transform = innerOriginals.transform;
                    inner.style.width = innerOriginals.width;
                    inner.style.height = innerOriginals.height;
                    inner.style.minHeight = innerOriginals.minHeight;
                }

                // Move element back to its original DOM placement
                if (originalSibling) {
                    originalParent.insertBefore(printArea, originalSibling);
                } else {
                    originalParent.appendChild(printArea);
                }

                // Cleanup sandbox
                document.body.removeChild(sandbox);
            }
        }

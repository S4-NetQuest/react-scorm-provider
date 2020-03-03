export const mockScorm = (global, version, data) => {
  switch (version) {
    case '1.2':
      setupSCORM_1(global, data);
      break;
    case '2004':
      setupSCORM_2004(global, data);
      break;
    default:
      throw new Error('mockScorm requires SCORM version');
  }
}

export const clearScorm = (global) => {
  global.API_1484_11 = null;
  global.API = null;
}

function setupSCORM_1(global, d = {}) {
  global.API = (function(){
    var data = {
      "cmi.core.student_id": "000001",
      "cmi.core.student_name": "Student, Joe",
      "cmi.core.lesson_location": "",
      "cmi.core.lesson_status": "not attempted",
      "cmi.suspend_data": "",
      ...d
    };
    return {
      LMSInitialize: function() {
        return "true";
      },
      LMSCommit: function() {
        return "true";
      },
      LMSFinish: function() {
        return "true";
      },
      LMSGetValue: function(model) {
        return data[model] || "";
      },
      LMSSetValue: function(model, value) {
        data[model] = value;
        return "true";
      },
      LMSGetLastError: function() {
        return "0";
      },
      LMSGetErrorString: function(errorCode) {
        return "No error";
      },
      LMSGetDiagnostic: function(errorCode) {
        return "No error";
      }
    };
  })();
}

function setupSCORM_2004(global, d = {}) {
  global.API_1484_11 = (function(){
    var data = {
      "cmi.core.student_id": "000001",
      "cmi.core.student_name": "Student, Joe",
      "cmi.core.lesson_location": "",
      "cmi.core.lesson_status": "not attempted",
      "cmi.suspend_data": "",
      ...d
    };
    return {
      Initialize: function() {
        return "true";
      },
      Commit: function() {
        return "true";
      },
      Terminate: function() {
        return "true";
      },
      GetValue: function(model) {
        return data[model] || "";
      },
      SetValue: function(model, value) {
        data[model] = value;
        return "true";
      },
      GetLastError: function() {
        return "0";
      },
      GetErrorString: function(errorCode) {
        return "No error";
      },
      GetDiagnostic: function(errorCode) {
        return "No error";
      }
    };
  })();
}